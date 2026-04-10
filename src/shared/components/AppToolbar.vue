<template>
  <q-toolbar class="app-toolbar bg-dark text-white">
    <q-toolbar-title class="app-toolbar__title">
      <img src="/horseracing.png" alt="RaceFlow" class="app-toolbar__logo" />
      RaceFlow
    </q-toolbar-title>

    <q-badge
      v-if="statusLabel"
      :color="statusColor"
      :label="statusLabel"
      class="q-mr-md app-toolbar__status"
    />

    <q-space />

    <q-toggle
      :model-value="autoPlay"
      label="Auto-play"
      dark
      color="amber"
      class="q-mr-lg"
      @update:model-value="$emit('update:autoPlay', $event)"
    />

    <div class="app-toolbar__actions">
      <q-btn
        label="Generate Program"
        color="amber-8"
        text-color="dark"
        no-caps
        no-wrap
        unelevated
        icon="casino"
        :disable="isGenerateDisabled"
        padding="0.5rem 1.25rem"
        class="app-toolbar__btn"
        @click="$emit('generate')"
      />

      <q-btn
        :label="raceButtonLabel"
        :color="raceButtonColor"
        :icon="raceButtonIcon"
        :disable="isRaceDisabled"
        no-caps
        no-wrap
        unelevated
        padding="0.5rem 1.25rem"
        class="app-toolbar__btn"
        @click="$emit('toggleRace')"
      />
    </div>
  </q-toolbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GameStatus } from '@/modules/Race/types/race.types'

/* === Props & Emits === */
const props = defineProps<{
  gameStatus: GameStatus
  autoPlay: boolean
}>()

defineEmits<{
  generate: []
  toggleRace: []
  'update:autoPlay': [value: boolean]
}>()

/* === Button State === */
const isGenerateDisabled = computed(
  () => props.gameStatus === GameStatus.RACING || props.gameStatus === GameStatus.PAUSED,
)

const isRaceDisabled = computed(
  () => props.gameStatus === GameStatus.IDLE || props.gameStatus === GameStatus.FINISHED,
)

const raceButtonLabel = computed(() => {
  switch (props.gameStatus) {
    case GameStatus.RACING:
      return 'Pause'
    case GameStatus.PAUSED:
      return 'Resume'
    case GameStatus.ROUND_FINISHED:
      return 'Next Round'
    default:
      return 'Start'
  }
})

const raceButtonColor = computed(() => {
  if (props.gameStatus === GameStatus.RACING) return 'negative'
  if (props.gameStatus === GameStatus.PAUSED) return 'warning'
  return 'positive'
})

const raceButtonIcon = computed(() => {
  switch (props.gameStatus) {
    case GameStatus.RACING:
      return 'pause'
    case GameStatus.PAUSED:
      return 'play_arrow'
    case GameStatus.ROUND_FINISHED:
      return 'skip_next'
    default:
      return 'play_arrow'
  }
})

/* === Status Indicator === */
const statusLabel = computed(() => {
  switch (props.gameStatus) {
    case GameStatus.RACING:
      return 'RACING'
    case GameStatus.PAUSED:
      return 'PAUSED'
    case GameStatus.FINISHED:
      return 'FINISHED'
    default:
      return ''
  }
})

const statusColor = computed(() => {
  switch (props.gameStatus) {
    case GameStatus.RACING:
      return 'positive'
    case GameStatus.PAUSED:
      return 'warning'
    case GameStatus.FINISHED:
      return 'info'
    default:
      return 'grey'
  }
})
</script>

<style scoped lang="scss">
.app-toolbar {
  padding: 0.75rem 1.5rem;
  min-height: 3.5rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.2);

  &__title {
    font-weight: 700;
    font-size: 1.4rem;
    flex: 0 0 auto;
  }

  &__logo {
    width: 1.75rem;
    height: 1.75rem;
    margin-right: 0.5rem;
    object-fit: contain;
    vertical-align: middle;
  }

  &__btn {
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 0.5rem;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  &__status {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.0625rem;
    padding: 0.25rem 0.625rem;
  }

  @media (max-width: 37.5rem) {
    padding: 0.5rem 0.75rem;
    min-height: 3rem;
    flex-wrap: wrap;
    gap: 0.25rem;

    &__title {
      font-size: 1.1rem;
    }

    &__logo {
      width: 1.25rem;
      height: 1.25rem;
      margin-right: 0.375rem;
    }

    &__btn {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;

      :deep(.q-btn__content) {
        gap: 0.25rem;
      }
    }

    &__status {
      font-size: 0.625rem;
      padding: 0.125rem 0.5rem;
    }
  }
}
</style>
