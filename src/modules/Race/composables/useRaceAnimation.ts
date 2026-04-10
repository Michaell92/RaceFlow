import { ref, onUnmounted, type Ref } from 'vue'
import type { RaceEntry, RaceResult } from '@/modules/Race/types/race.types'

/* === Configuration === */

const FRAME_COUNT = 16 // Total sprite frames per gallop cycle (frame_01..frame_16)
const BASE_DURATION_MS = 10_000 // How long (ms) a 1200m race takes at condition=100 & variance=1
const BASE_DISTANCE = 1200 // Reference distance that maps to BASE_DURATION_MS
const SPEED_VARIANCE_MIN = 0.85 // Min random multiplier applied to horse speed
const SPEED_VARIANCE_MAX_STRONG = 1.4 // Max variance for condition=100 (stable)
const SPEED_VARIANCE_MAX_WEAK = 2.5 // Max variance for condition=1 (upset potential)
const VARIANCE_INTERVAL_MS = 500 // Re-roll speed variance every 500ms for natural movement
const FRAME_INTERVAL_MS = 60 // Switch sprite frame every 60ms (~16 FPS gallop animation)

/** Internal per-horse tracking during a race */
interface HorseState {
  progress: number // 0–100, how far along the track
  speed: number // Current speed multiplier (condition × variance)
  lastVarianceTime: number // Elapsed ms when variance was last re-rolled
  finishTimeMs: number | null // Elapsed ms when horse crossed 100%, null if still running
}

/**
 * Composable that drives the race animation loop.
 *
 * Responsibilities:
 * - Tracks each horse's position (0–100%) via requestAnimationFrame
 * - Cycles a shared sprite frame cursor (0–15) for the gallop animation
 * - Supports start / pause / resume
 * - Calls onRaceComplete with sorted results when all horses finish
 *
 * The consuming component uses:
 * - `horsePositions` to set each horse's X position on the track
 * - `frameCursor` to pick which frame_XX sprite component to render
 */
export function useRaceAnimation(
  entries: Ref<RaceEntry[]>,
  distance: Ref<number>,
  onRaceComplete: (results: RaceResult[]) => void,
) {
  /* === Reactive state (exposed to template) === */
  const horsePositions = ref<Map<number, number>>(new Map()) // horseId → progress 0-100%
  const frameCursor = ref(0) // Current sprite frame index (0–15)
  const isRunning = ref(false)

  /* === Internal (non-reactive) state === */
  let animationFrameId: number | null = null
  let startTime = 0 // rAF timestamp when race started / resumed
  let pausedElapsed = 0 // Accumulated elapsed time before current resume
  let lastTickTime = 0 // rAF timestamp of the previous tick (for delta calculation)
  const horseStates = new Map<number, HorseState>()
  let finishedHorses: { horseId: number; finishTimeMs: number }[] = []
  let lastFrameSwitch = 0 // rAF timestamp of last sprite frame switch

  function getRandomVariance(condition: number): number {
    // Low condition → higher max variance, high condition → stable
    const conditionFactor = 1 - condition / 100
    const varianceMax =
      SPEED_VARIANCE_MAX_STRONG +
      conditionFactor * (SPEED_VARIANCE_MAX_WEAK - SPEED_VARIANCE_MAX_STRONG)
    return SPEED_VARIANCE_MIN + Math.random() * (varianceMax - SPEED_VARIANCE_MIN)
  }

  /** Compress condition into 0.5–1.0 range so weak horses aren't impossibly slow */
  function getBaseSpeed(condition: number): number {
    return 0.5 + 0.5 * (condition / 100)
  }

  /** Reset all horse states to starting positions before a new race */
  function initHorseStates(): void {
    horseStates.clear()
    finishedHorses = []
    const positions = new Map<number, number>()

    for (const entry of entries.value) {
      const baseSpeed =
        getBaseSpeed(entry.horse.condition) * getRandomVariance(entry.horse.condition)
      horseStates.set(entry.horse.id, {
        progress: 0,
        speed: baseSpeed,
        lastVarianceTime: 0,
        finishTimeMs: null,
      })
      positions.set(entry.horse.id, 0)
    }

    horsePositions.value = positions
  }

  /**
   * Core animation loop — called every frame by requestAnimationFrame.
   * Updates each horse's position based on elapsed time and their speed.
   */
  function tick(frameTimestamp: number): void {
    if (!isRunning.value) return

    // Total elapsed time including any paused segments
    const elapsedMs = frameTimestamp - startTime + pausedElapsed
    // Time since the last frame — used for incremental progress
    const deltaMs = frameTimestamp - lastTickTime
    lastTickTime = frameTimestamp

    // Scale race duration proportionally: 2200m takes longer than 1200m
    const raceDurationMs = (distance.value / BASE_DISTANCE) * BASE_DURATION_MS
    const totalHorses = entries.value.length
    const updatedPositions = new Map<number, number>()

    for (const entry of entries.value) {
      const horseState = horseStates.get(entry.horse.id)
      if (!horseState) continue

      // Already finished — pin at 100%
      if (horseState.finishTimeMs !== null) {
        updatedPositions.set(entry.horse.id, 100)
        continue
      }

      // Re-roll speed variance every VARIANCE_INTERVAL_MS for natural jittery movement
      const timeSinceLastVariance = elapsedMs - horseState.lastVarianceTime
      if (timeSinceLastVariance > VARIANCE_INTERVAL_MS) {
        horseState.speed =
          getBaseSpeed(entry.horse.condition) * getRandomVariance(entry.horse.condition)
        horseState.lastVarianceTime = elapsedMs
      }

      // Delta-based: advance by (deltaMs / raceDuration) × 100 × speed
      // This prevents teleporting when speed variance re-rolls
      const deltaProgress = (deltaMs / raceDurationMs) * 100 * horseState.speed
      horseState.progress = Math.min(horseState.progress + deltaProgress, 100)
      updatedPositions.set(entry.horse.id, horseState.progress)

      // Horse just crossed the finish line
      if (horseState.progress >= 100) {
        horseState.finishTimeMs = elapsedMs
        finishedHorses.push({ horseId: entry.horse.id, finishTimeMs: elapsedMs })
      }
    }

    // Advance sprite frame on interval if enough time has passed (shared across all horses)
    // Loops back to frame 0 after reaching the last frame (16 → 0)
    const timeSinceLastFrame = frameTimestamp - lastFrameSwitch
    if (timeSinceLastFrame >= FRAME_INTERVAL_MS) {
      const nextFrame = frameCursor.value + 1
      frameCursor.value = nextFrame >= FRAME_COUNT ? 0 : nextFrame
      lastFrameSwitch = frameTimestamp
    }

    horsePositions.value = updatedPositions

    // All horses finished — sort by finish time and report results
    if (finishedHorses.length >= totalHorses) {
      isRunning.value = false
      animationFrameId = null

      const sortedByFinishTime = [...finishedHorses].sort(
        (first, second) => first.finishTimeMs - second.finishTimeMs,
      )
      const entryByHorseId = new Map(entries.value.map((entry) => [entry.horse.id, entry]))

      const results: RaceResult[] = sortedByFinishTime.map((finishedHorse, index) => ({
        position: index + 1,
        horse: entryByHorseId.get(finishedHorse.horseId)!.horse,
        finishTimeMs: finishedHorse.finishTimeMs,
      }))

      onRaceComplete(results)
      return
    }

    animationFrameId = requestAnimationFrame(tick)
  }

  /** Start a fresh race from the beginning */
  function start(): void {
    initHorseStates()
    frameCursor.value = 0
    pausedElapsed = 0
    isRunning.value = true
    lastFrameSwitch = 0
    animationFrameId = requestAnimationFrame((firstFrameTimestamp) => {
      startTime = firstFrameTimestamp
      lastTickTime = firstFrameTimestamp
      tick(firstFrameTimestamp)
    })
  }

  /** Pause — saves elapsed time so resume can continue from same point */
  function pause(): void {
    if (!isRunning.value) return
    isRunning.value = false
    pausedElapsed += performance.now() - startTime
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  /** Resume from where we paused */
  function resume(): void {
    if (isRunning.value) return
    isRunning.value = true
    animationFrameId = requestAnimationFrame((resumeTimestamp) => {
      startTime = resumeTimestamp
      lastTickTime = resumeTimestamp
      tick(resumeTimestamp)
    })
  }

  /** Stop the race and reset all state to starting positions */
  function stop(): void {
    isRunning.value = false
    pausedElapsed = 0
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    horseStates.clear()
    finishedHorses = []

    const positions = new Map<number, number>()
    for (const entry of entries.value) {
      positions.set(entry.horse.id, 0)
    }
    horsePositions.value = positions
    frameCursor.value = 0
  }

  // Cleanup rAF on component unmount to prevent memory leaks
  onUnmounted(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }
  })

  return {
    horsePositions,
    frameCursor,
    isRunning,
    start,
    pause,
    resume,
    stop,
  }
}
