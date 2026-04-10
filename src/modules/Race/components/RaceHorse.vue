<template>
  <div class="race-horse" :style="{ marginLeft: `${position}%` }">
    <div class="race-horse__sprite">
      <component :is="currentFrame" :color="color" />
    </div>
    <span class="race-horse__name text-caption text-weight-medium">{{ name }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

import frame_01 from '@/modules/Horse/components/spritesheet/frame_01.vue'
import frame_02 from '@/modules/Horse/components/spritesheet/frame_02.vue'
import frame_03 from '@/modules/Horse/components/spritesheet/frame_03.vue'
import frame_04 from '@/modules/Horse/components/spritesheet/frame_04.vue'
import frame_05 from '@/modules/Horse/components/spritesheet/frame_05.vue'
import frame_06 from '@/modules/Horse/components/spritesheet/frame_06.vue'
import frame_07 from '@/modules/Horse/components/spritesheet/frame_07.vue'
import frame_08 from '@/modules/Horse/components/spritesheet/frame_08.vue'
import frame_09 from '@/modules/Horse/components/spritesheet/frame_09.vue'
import frame_10 from '@/modules/Horse/components/spritesheet/frame_10.vue'
import frame_11 from '@/modules/Horse/components/spritesheet/frame_11.vue'
import frame_12 from '@/modules/Horse/components/spritesheet/frame_12.vue'
import frame_13 from '@/modules/Horse/components/spritesheet/frame_13.vue'
import frame_14 from '@/modules/Horse/components/spritesheet/frame_14.vue'
import frame_15 from '@/modules/Horse/components/spritesheet/frame_15.vue'
import frame_16 from '@/modules/Horse/components/spritesheet/frame_16.vue'

/* === Props === */
const props = defineProps<{
  color: string
  name: string
  position: number // 0–100 (% of track)
  frameCursor: number // 0–15 (sprite frame index)
  isRunning: boolean
}>()

/* === Sprite Frame Mapping === */
const frames: Component[] = [
  frame_01,
  frame_02,
  frame_03,
  frame_04,
  frame_05,
  frame_06,
  frame_07,
  frame_08,
  frame_09,
  frame_10,
  frame_11,
  frame_12,
  frame_13,
  frame_14,
  frame_15,
  frame_16,
]

const currentFrame = computed(() => {
  if (!props.isRunning && props.position === 0) return frames[0]!
  return frames[props.frameCursor] ?? frames[0]!
})
</script>

<style scoped lang="scss">
.race-horse {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  will-change: margin-left;

  &__sprite {
    width: auto;
    height: auto;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &__name {
    white-space: nowrap;
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.6);
  }
}
</style>
