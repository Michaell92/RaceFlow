import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHorseStore } from '@/modules/Horse/stores/horseStore'

describe('horseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with an empty horses array', () => {
    const store = useHorseStore()
    expect(store.horses).toHaveLength(0)
  })

  it('populates 20 horses after generateHorses()', () => {
    const store = useHorseStore()
    store.generateHorses()
    expect(store.horses).toHaveLength(20)
  })

  it('getHorseById returns a matching horse', () => {
    const store = useHorseStore()
    store.generateHorses()
    const horse = store.getHorseById(1)
    expect(horse).toBeDefined()
    expect(horse!.id).toBe(1)
  })

  it('getHorseById returns undefined for non-existent id', () => {
    const store = useHorseStore()
    store.generateHorses()
    expect(store.getHorseById(999)).toBeUndefined()
  })

  it('regenerates fresh horses on repeated calls', () => {
    const store = useHorseStore()
    store.generateHorses()
    const firstConditions = store.horses.map((h) => h.condition)
    store.generateHorses()
    const secondConditions = store.horses.map((h) => h.condition)
    expect(store.horses).toHaveLength(20)
    // Conditions are random — extremely unlikely to match twice
    const allMatch = firstConditions.every((c, i) => c === secondConditions[i])
    expect(allMatch).toBe(false)
  })
})
