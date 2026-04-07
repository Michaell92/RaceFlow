import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { Horse } from '@/modules/Horse/types/horse.types'
import { generateHorses as generate } from '@/modules/Horse/utils/horseGenerator'

export const useHorseStore = defineStore('horse', () => {
  const horses: Ref<Horse[]> = ref([])

  function generateHorses(): void {
    horses.value = generate()
  }

  function getHorseById(id: number): Horse | undefined {
    return horses.value.find((horse) => horse.id === id)
  }

  return { horses, generateHorses, getHorseById }
})
