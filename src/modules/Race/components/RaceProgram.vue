<template>
  <q-card class="race-program shadow-2">
    <q-card-section class="race-program__header">
      <div class="row items-center no-wrap">
        <q-icon name="format_list_numbered" size="1.25rem" color="primary" class="q-mr-sm" />
        <div class="text-h6">Race Program</div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="schedule.length === 0" class="race-program__empty">
      <div class="text-body2 text-grey-6 text-center">
        No program yet. Click "Generate Program" to begin.
      </div>
    </q-card-section>

    <q-card-section v-else class="race-program__body">
      <q-list separator>
        <q-expansion-item
          v-for="(round, index) in schedule"
          :key="round.config.roundNumber"
          :label="`Round ${round.config.roundNumber}`"
          :caption="`${round.config.distance}m`"
          :default-opened="index === currentRoundIndex"
          :header-class="getHeaderClass(index)"
          dense
        >
          <q-table
            :rows="round.entries"
            :columns="columns"
            row-key="lane"
            flat
            dense
            hide-bottom
            :rows-per-page-options="[0]"
            class="race-program__table"
          >
            <template #body-cell-lane="props">
              <q-td :props="props">
                <span class="text-weight-medium">{{ props.row.lane }}</span>
              </q-td>
            </template>

            <template #body-cell-color="props">
              <q-td :props="props">
                <q-badge
                  :style="{ backgroundColor: props.row.horse.color }"
                  rounded
                  class="race-program__color-badge"
                />
              </q-td>
            </template>

            <template #body-cell-name="props">
              <q-td :props="props">
                {{ props.row.horse.name }}
              </q-td>
            </template>
          </q-table>
        </q-expansion-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import type { RoundSchedule } from '@/modules/Race/types/race.types'
import { getHeaderClass as _getHeaderClass } from '@/modules/Race/utils/raceHelpers'

/* === Props === */
const props = defineProps<{
  schedule: RoundSchedule[]
  currentRoundIndex: number
}>()

/* === Table Config === */
const columns: QTableColumn[] = [
  {
    name: 'lane',
    label: 'Lane',
    field: 'lane',
    align: 'center',
    sortable: false,
    style: 'width: 2.5rem',
  },
  {
    name: 'color',
    label: '',
    field: 'lane',
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
]

/* === Helpers === */
function getHeaderClass(index: number): string {
  return _getHeaderClass(index, props.currentRoundIndex, 'race-program__round--active')
}
</script>

<style scoped lang="scss">
.race-program {
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
    padding: 2rem 1rem;
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

  &__color-badge {
    width: 0.75rem;
    height: 0.75rem;
    min-height: unset;
    padding: 0;
    box-shadow: 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.2);
  }

  &__round--active {
    font-weight: 700;
  }
}
</style>
