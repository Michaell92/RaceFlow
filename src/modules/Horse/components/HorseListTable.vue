<template>
  <q-card class="horse-list-table shadow-2">
    <q-card-section class="horse-list-table__header">
      <div class="row items-center no-wrap">
        <q-icon name="military_tech" size="1.25rem" color="primary" class="q-mr-sm" />
        <div class="text-h6">Horse List</div>
        <q-badge color="grey-7" :label="horses.length" class="q-ml-sm" />
      </div>
    </q-card-section>

    <q-separator />

    <q-table
      :rows="horses"
      :columns="columns"
      row-key="id"
      flat
      dense
      hide-bottom
      :rows-per-page-options="[0]"
      class="horse-list-table__table"
    >
      <template #body-cell-index="props">
        <q-td :props="props">
          <span class="text-weight-medium">{{ props.rowIndex + 1 }}</span>
        </q-td>
      </template>

      <template #body-cell-color="props">
        <q-td :props="props">
          <q-badge
            :style="{ backgroundColor: props.row.color }"
            rounded
            class="horse-list-table__color-badge"
            :aria-label="`Horse color: ${props.row.color}`"
          />
        </q-td>
      </template>

      <template #body-cell-condition="props">
        <q-td :props="props">
          <div class="horse-list-table__condition">
            <q-linear-progress
              :value="props.row.condition / 100"
              :color="getConditionColor(props.row.condition)"
              rounded
              size="1.25rem"
              class="horse-list-table__condition-bar"
              :aria-label="`Condition: ${props.row.condition} out of 100`"
            >
              <div class="absolute-full flex flex-center">
                <span class="horse-list-table__condition-label text-caption text-weight-bold">
                  {{ props.row.condition }}
                </span>
              </div>
            </q-linear-progress>
          </div>
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import type { Horse } from '@/modules/Horse/types/horse.types'

/* === Props === */
defineProps<{
  horses: Horse[]
}>()

/* === Table Config === */
const columns: QTableColumn[] = [
  {
    name: 'index',
    label: '#',
    field: 'id',
    align: 'center',
    sortable: false,
    style: 'width: 2.5rem',
  },
  {
    name: 'color',
    label: 'Color',
    field: 'color',
    align: 'center',
    sortable: false,
    style: 'width: 3rem',
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'condition',
    label: 'Condition',
    field: 'condition',
    align: 'center',
    sortable: true,
    style: 'width: 6rem',
  },
]

function getConditionColor(condition: number): string {
  if (condition >= 70) return 'positive'
  if (condition >= 40) return 'warning'
  return 'negative'
}
</script>

<style scoped lang="scss">
.horse-list-table {
  height: 100%;
  display: flex;
  flex-direction: column;

  &__header {
    padding: 0.75rem 1rem;
  }

  &__table {
    flex: 1;
    overflow: auto;

    :deep(tbody tr:hover) {
      background: rgba(0, 0, 0, 0.03);
    }
  }

  &__color-badge {
    width: 1rem;
    height: 1rem;
    min-height: unset;
    padding: 0;
    box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.2);
  }

  &__condition {
    width: 100%;
  }

  &__condition-bar {
    min-width: 3.5rem;
  }

  &__condition-label {
    font-size: 0.65rem;
    color: white;
    text-shadow: 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.4);
  }
}
</style>
