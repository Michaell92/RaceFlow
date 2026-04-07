import { ref, onUnmounted, type Ref } from 'vue'
import type { RaceEntry, RaceResult } from '@/modules/Race/types/race.types'

/* === Configuration === */

const FRAME_COUNT = 16 // Total sprite frames per gallop cycle (frame_01..frame_16)
const BASE_DURATION_MS = 15_000 // How long (ms) a 1200m race takes at condition=100 & variance=1
const BASE_DISTANCE = 1200 // Reference distance that maps to BASE_DURATION_MS
const SPEED_VARIANCE_MIN = 0.85 // Min random multiplier applied to horse speed
const SPEED_VARIANCE_MAX = 1.15 // Max random multiplier applied to horse speed
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
  const horseStates = new Map<number, HorseState>()
  let finishedHorses: { horseId: number; finishTimeMs: number }[] = []
  let lastFrameSwitch = 0 // rAF timestamp of last sprite frame switch

  function getRandomVariance(): number {
    return SPEED_VARIANCE_MIN + Math.random() * (SPEED_VARIANCE_MAX - SPEED_VARIANCE_MIN)
  }

  /** Reset all horse states to starting positions before a new race */
  function initHorseStates(): void {
    horseStates.clear()
    finishedHorses = []
    const positions = new Map<number, number>()

    for (const entry of entries.value) {
      const baseSpeed = (entry.horse.condition / 100) * getRandomVariance()
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
  function tick(timestamp: number): void {
    if (!isRunning.value) return

    // Total elapsed time including any paused segments
    const elapsed = timestamp - startTime + pausedElapsed

    // Scale race duration proportionally: 2200m takes longer than 1200m
    const raceDuration = (distance.value / BASE_DISTANCE) * BASE_DURATION_MS
    const totalHorses = entries.value.length
    const positions = new Map<number, number>()

    for (const entry of entries.value) {
      const state = horseStates.get(entry.horse.id)
      if (!state) continue

      // Already finished — pin at 100%
      if (state.finishTimeMs !== null) {
        positions.set(entry.horse.id, 100)
        continue
      }

      // Re-roll speed variance every VARIANCE_INTERVAL_MS for natural jittery movement
      if (elapsed - state.lastVarianceTime > VARIANCE_INTERVAL_MS) {
        state.speed = (entry.horse.condition / 100) * getRandomVariance()
        state.lastVarianceTime = elapsed
      }

      // progress = (time fraction) × horse speed, clamped to 100
      const baseProgress = (elapsed / raceDuration) * 100
      state.progress = Math.min(baseProgress * state.speed, 100)
      positions.set(entry.horse.id, state.progress)

      // Horse just crossed the finish line
      if (state.progress >= 100) {
        state.finishTimeMs = elapsed
        finishedHorses.push({ horseId: entry.horse.id, finishTimeMs: elapsed })
      }
    }

    // Advance sprite frame on interval (shared across all horses)
    if (timestamp - lastFrameSwitch >= FRAME_INTERVAL_MS) {
      frameCursor.value = (frameCursor.value + 1) % FRAME_COUNT
      lastFrameSwitch = timestamp
    }

    horsePositions.value = positions

    // All horses finished — sort by finish time and report results
    if (finishedHorses.length >= totalHorses) {
      isRunning.value = false
      animationFrameId = null

      const sorted = [...finishedHorses].sort((a, b) => a.finishTimeMs - b.finishTimeMs)
      const entryMap = new Map(entries.value.map((e) => [e.horse.id, e]))

      const results: RaceResult[] = sorted.map((fh, index) => ({
        position: index + 1,
        horse: entryMap.get(fh.horseId)!.horse,
        finishTimeMs: fh.finishTimeMs,
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
    animationFrameId = requestAnimationFrame((ts) => {
      startTime = ts
      tick(ts)
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
    animationFrameId = requestAnimationFrame((ts) => {
      startTime = ts
      tick(ts)
    })
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
  }
}
