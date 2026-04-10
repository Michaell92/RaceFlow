<template>
  <q-card class="race-results shadow-2">
    <q-card-section class="race-results__header">
      <div class="row items-center no-wrap">
        <q-icon name="leaderboard" size="1.25rem" color="primary" class="q-mr-sm" />
        <div class="text-h6">Results</div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="results.length === 0" class="race-results__empty">
      <div class="text-body2 text-grey-6 text-center">No results yet. Start a race!</div>
    </q-card-section>

    <q-card-section v-else class="race-results__body">
      <q-list separator>
        <TransitionGroup name="race-results__fade">
          <q-expansion-item
            v-for="round in results"
            :key="round.roundNumber"
            :label="`Round ${round.roundNumber}`"
            default-opened
            dense
            header-class="bg-green-7 text-white"
          >
            <q-table
              :rows="round.results"
              :columns="columns"
              row-key="position"
              flat
              dense
              hide-bottom
              :rows-per-page-options="[0]"
              class="race-results__table"
            >
              <template #body-cell-position="props">
                <q-td :props="props">
                  <q-badge
                    :color="getMedalColor(props.row.position)"
                    :label="props.row.position"
                    rounded
                    class="race-results__position-badge"
                  />
                </q-td>
              </template>

              <template #body-cell-color="props">
                <q-td :props="props">
                  <q-badge
                    :style="{ backgroundColor: props.row.horse.color }"
                    rounded
                    class="race-results__color-badge"
                  />
                </q-td>
              </template>

              <template #body-cell-name="props">
                <q-td :props="props">
                  {{ props.row.horse.name }}
                </q-td>
              </template>

              <template #body-cell-time="props">
                <q-td :props="props">
                  <span class="text-caption text-grey-7">
                    {{ formatTime(props.row.finishTimeMs) }}
                  </span>
                </q-td>
              </template>
            </q-table>
          </q-expansion-item>
        </TransitionGroup>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import type { RoundResult } from '@/modules/Race/types/race.types'
import { getMedalColor } from '@/modules/Race/utils/raceHelpers'
import { formatTime } from '@/shared/utils/formatters'

/* === Props === */
defineProps<{
  results: RoundResult[]
}>()

/* === Table Config === */
const columns: QTableColumn[] = [
  {
    name: 'position',
    label: '#',
    field: 'position',
    align: 'center',
    sortable: false,
    style: 'width: 2.5rem',
  },
  {
    name: 'color',
    label: '',
    field: 'position',
    align: 'center',
    sortable: false,
    style: 'width: 2rem',
  },
  {
    name: 'name',
    label: 'Horse',
    field: (row) => row.horse.name,
    align: 'left',
    sortable: false,
  },
  {
    name: 'time',
    label: 'Time',
    field: 'finishTimeMs',
    align: 'right',
    sortable: false,
    style: 'width: 4rem',
  },
]
</script>

<style scoped lang="scss">
.race-results {
  height: 100%;
  display: flex;
  flex-direction: column;

  &__header {
    padding: 0.75rem 1rem;
  }

  &__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    flex: 1;
    overflow: auto;
    padding: 0;
  }

  &__table {
    :deep(th),
    :deep(td) {
      padding: 0.25rem 0.5rem;
    }

    :deep(tbody tr:hover) {
      background: rgba(0, 0, 0, 0.03);
    }
  }

  &__position-badge {
    min-height: unset;
    font-size: 0.7rem;
    padding: 0.125rem 0.375rem;
  }

  &__color-badge {
    width: 0.75rem;
    height: 0.75rem;
    min-height: unset;
    padding: 0;
    box-shadow: 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.2);
  }

  &__fade-enter-active {
    transition:
      opacity 0.5s ease,
      transform 0.5s ease;
  }

  &__fade-enter-from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
}
</style>
