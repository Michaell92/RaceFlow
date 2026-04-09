import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useRaceAnimation } from '@/modules/Race/composables/useRaceAnimation'
import type { RaceEntry, RaceResult } from '@/modules/Race/types/race.types'
import type { Horse } from '@/modules/Horse/types/horse.types'

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')
  return { ...actual, onUnmounted: vi.fn() }
})

function createHorse(id: number, condition: number): Horse {
  return { id, name: `Horse ${id}`, color: '#000000', condition }
}

function createEntries(count: number, condition = 100): RaceEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    horse: createHorse(i + 1, condition),
    lane: i + 1,
  }))
}

describe('useRaceAnimation', () => {
  let rafCallbacks: ((timestamp: number) => void)[]
  let rafId: number

  beforeEach(() => {
    rafCallbacks = []
    rafId = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return ++rafId
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /** Flush all pending rAF callbacks at given timestamp */
  function flushRaf(timestamp: number): void {
    const pending = [...rafCallbacks]
    rafCallbacks = []
    pending.forEach((cb) => cb(timestamp))
  }

  it('initializes with empty positions and not running', () => {
    const entries = ref(createEntries(3))
    const distance = ref(1200)
    const { horsePositions, isRunning } = useRaceAnimation(entries, distance, vi.fn())

    expect(isRunning.value).toBe(false)
    expect(horsePositions.value.size).toBe(0)
  })

  it('start() sets isRunning and initializes positions to 0', () => {
    const entries = ref(createEntries(3))
    const distance = ref(1200)
    const { horsePositions, isRunning, start } = useRaceAnimation(entries, distance, vi.fn())

    start()

    expect(isRunning.value).toBe(true)
    // First rAF queued — flush it to trigger initHorseStates positions
    flushRaf(0)
    expect(horsePositions.value.size).toBe(3)
    horsePositions.value.forEach((progress) => {
      expect(progress).toBeGreaterThanOrEqual(0)
    })
  })

  it('positions advance after time passes', () => {
    const entries = ref(createEntries(2, 100))
    const distance = ref(1200)
    const { horsePositions, start } = useRaceAnimation(entries, distance, vi.fn())

    start()
    flushRaf(0) // t=0 — sets startTime
    flushRaf(5000) // t=5000ms — should have progressed

    horsePositions.value.forEach((progress) => {
      expect(progress).toBeGreaterThan(0)
      expect(progress).toBeLessThanOrEqual(100)
    })
  })

  it('pause() stops the animation', () => {
    const entries = ref(createEntries(2))
    const distance = ref(1200)
    const { isRunning, start, pause } = useRaceAnimation(entries, distance, vi.fn())

    start()
    flushRaf(0)

    expect(isRunning.value).toBe(true)
    pause()
    expect(isRunning.value).toBe(false)
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it('resume() restarts the animation after pause', () => {
    const entries = ref(createEntries(2))
    const distance = ref(1200)
    const { isRunning, start, pause, resume } = useRaceAnimation(entries, distance, vi.fn())

    start()
    flushRaf(0)
    pause()
    expect(isRunning.value).toBe(false)

    resume()
    expect(isRunning.value).toBe(true)
  })

  it('calls onRaceComplete when all horses finish', () => {
    const onComplete = vi.fn()
    const entries = ref(createEntries(2, 100))
    const distance = ref(1200)
    const { start } = useRaceAnimation(entries, distance, onComplete)

    start()
    flushRaf(0) // t=0

    // Simulate enough time for all horses to finish (>15s with condition=100)
    flushRaf(20_000)

    expect(onComplete).toHaveBeenCalledOnce()
    const results: RaceResult[] = onComplete.mock.calls[0][0]
    expect(results).toHaveLength(2)
    results.forEach((r, i) => {
      expect(r.position).toBe(i + 1)
      expect(r.horse).toBeDefined()
      expect(r.finishTimeMs).toBeGreaterThan(0)
    })
  })

  it('results are sorted by finish time (fastest first)', () => {
    const onComplete = vi.fn()
    const entries = ref(createEntries(2, 100))
    const distance = ref(1200)
    const { start } = useRaceAnimation(entries, distance, onComplete)

    start()
    flushRaf(0)
    flushRaf(20_000)

    const results: RaceResult[] = onComplete.mock.calls[0][0]
    for (let i = 1; i < results.length; i++) {
      expect(results[i].finishTimeMs).toBeGreaterThanOrEqual(results[i - 1].finishTimeMs)
    }
  })

  it('frameCursor cycles through 0–15', () => {
    const entries = ref(createEntries(2))
    const distance = ref(1200)
    const { frameCursor, start } = useRaceAnimation(entries, distance, vi.fn())

    start()
    flushRaf(0)
    expect(frameCursor.value).toBe(0)

    // Each flush at 60ms+ interval should bump frameCursor
    flushRaf(70)
    expect(frameCursor.value).toBe(1)

    flushRaf(140)
    expect(frameCursor.value).toBe(2)
  })
})
