<template>
  <q-card class="race-track shadow-2">
    <q-card-section class="race-track__header">
      <div class="row items-center justify-between no-wrap">
        <div class="row items-center no-wrap">
          <q-icon name="sports_score" size="1.25rem" color="primary" class="q-mr-sm" />
          <div class="text-h6">{{ roundLabel }}</div>
        </div>
        <q-badge outline color="primary" class="text-caption"> {{ distance }}m </q-badge>
      </div>
    </q-card-section>

    <q-separator />

    <div v-if="entries.length === 0" class="race-track__empty">
      <q-icon name="sports_score" size="3rem" color="grey-5" />
      <p class="text-body2 text-grey-6">Generate a program to start racing</p>
    </div>

    <div
      v-else
      class="race-track__surface"
      role="img"
      :aria-label="`Race track with ${entries.length} horses`"
    >
      <div class="race-track__markers">
        <span
          v-for="pct in [25, 50, 75]"
          :key="pct"
          class="race-track__marker"
          :style="{ left: `calc(1.75rem + (100% - 5.25rem) * ${pct / 100})` }"
        >
          {{ Math.round((distance * pct) / 100) }}m
        </span>
      </div>

      <div
        v-for="entry in entries"
        :key="entry.horse.id"
        class="race-track__lane"
        :class="{ 'race-track__lane--odd': entry.lane % 2 === 1 }"
        :aria-label="`Lane ${entry.lane}: ${entry.horse.name}`"
      >
        <span class="race-track__lane-number text-caption text-weight-medium">
          {{ entry.lane }}
        </span>

        <div class="race-track__lane-track">
          <RaceHorse
            :color="entry.horse.color"
            :name="entry.horse.name"
            :position="horsePositions.get(entry.horse.id) ?? 0"
            :frame-cursor="frameCursor"
            :is-running="isRunning"
          />
        </div>
      </div>

      <div class="race-track__finish" />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import type { RaceEntry } from '@/modules/Race/types/race.types'
import RaceHorse from '@/modules/Race/components/RaceHorse.vue'

/* === Props === */
defineProps<{
  entries: RaceEntry[]
  horsePositions: Map<number, number>
  frameCursor: number
  isRunning: boolean
  roundLabel: string
  distance: number
}>()
</script>

<style scoped lang="scss">
.race-track {
  height: 100%;
  display: flex;
  flex-direction: column;

  &__header {
    padding: 0.75rem 1rem;
  }

  &__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: linear-gradient(180deg, #2e7d32 0%, #256428 100%);
  }

  &__surface {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow-y: auto;
    background: linear-gradient(180deg, #2e7d32 0%, #256428 100%);
  }

  &__markers {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  &__marker {
    position: absolute;
    top: 0;
    bottom: 0;
    border-left: 0.0625rem dashed rgba(255, 255, 255, 0.15);
    font-size: 0.5rem;
    color: rgba(255, 255, 255, 0.35);
    padding-left: 0.25rem;
    padding-top: 0.125rem;
  }

  &__lane {
    flex: 1;
    display: flex;
    align-items: stretch;
    position: relative;
    min-height: 3.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.08);
    z-index: 1;

    &--odd {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &__lane-number {
    width: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.7);
    background: rgba(0, 0, 0, 0.15);
    border-right: 0.0625rem solid rgba(255, 255, 255, 0.15);
  }

  &__lane-track {
    flex: 1;
    position: relative;
    // Leave room for the horse sprite to not overflow the finish line visually
    padding-right: 3.5rem;
  }

  &__finish {
    position: absolute;
    right: 3.5rem;
    top: 0;
    bottom: 0;
    width: 0.375rem;
    background: repeating-linear-gradient(
      to bottom,
      #fff 0,
      #fff 0.375rem,
      #111 0.375rem,
      #111 0.75rem
    );
    opacity: 0.9;
    z-index: 2;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.3);

    &::after {
      content: 'FINISH';
      position: absolute;
      top: -0.125rem;
      right: 0.5rem;
      font-size: 0.5625rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.8);
      letter-spacing: 0.0625rem;
      white-space: nowrap;
      transform: translateY(-100%);
    }
  }
}
</style>
