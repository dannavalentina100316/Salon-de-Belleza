<template>
  <section class="base-table">
    <div v-if="searchable || $slots.toolbar" class="table-toolbar">
      <label v-if="searchable" class="table-search">
        <span class="sr-only">{{ searchLabel }}</span>
        <input
          :value="modelValue"
          type="search"
          :placeholder="searchPlaceholder"
          :aria-label="searchLabel"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </label>
      <slot name="toolbar"></slot>
    </div>

    <div v-if="loading" class="table-state" role="status">
      <span class="table-spinner" aria-hidden="true"></span>
      <span>{{ loadingMessage }}</span>
    </div>

    <div v-else-if="error" class="table-state state-error" role="alert">
      {{ error }}
    </div>

    <div v-else-if="!filteredRows.length" class="table-state">
      <strong>{{ modelValue?.trim() ? noResultsMessage : emptyMessage }}</strong>
      <p v-if="modelValue?.trim() ? noResultsDescription : emptyDescription">
        {{ modelValue?.trim() ? noResultsDescription : emptyDescription }}
      </p>
      <slot v-if="!modelValue?.trim()" name="empty-action"></slot>
    </div>

    <div v-else class="table-scroll">
      <table>
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="column.headerClass"
              :style="{ textAlign: column.align || 'left' }"
              scope="col"
            >
              {{ column.label }}
            </th>
            <th v-if="$slots.actions" scope="col">{{ actionsLabel }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in visibleRows" :key="getRowKey(row, index)">
            <td
              v-for="column in columns"
              :key="column.key"
              :class="column.cellClass"
              :style="{ textAlign: column.align || 'left' }"
            >
              <slot
                name="cell"
                :row="row"
                :column="column"
                :value="getCellValue(row, column)"
                :index="index"
              >
                {{ formatValue(getCellValue(row, column)) }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="table-actions-cell">
              <slot name="actions" :row="row" :index="index"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="pageSize > 0 && filteredRows.length > pageSize" class="table-pagination">
      <span>{{ firstVisible }}–{{ lastVisible }} de {{ filteredRows.length }}</span>
      <div>
        <BaseButton variant="secondary" size="small" :disabled="page === 1" @click="page -= 1">
          Anterior
        </BaseButton>
        <BaseButton variant="secondary" size="small" :disabled="page >= pageCount" @click="page += 1">
          Siguiente
        </BaseButton>
      </div>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: '_id',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingMessage: {
    type: String,
    default: 'Cargando información...',
  },
  error: {
    type: String,
    default: '',
  },
  emptyMessage: {
    type: String,
    default: 'No hay registros para mostrar',
  },
  emptyDescription: {
    type: String,
    default: '',
  },
  noResultsMessage: {
    type: String,
    default: 'No se encontraron coincidencias',
  },
  noResultsDescription: {
    type: String,
    default: 'Prueba otro término o limpia la búsqueda.',
  },
  actionsLabel: {
    type: String,
    default: 'Acciones',
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: '',
  },
  searchPlaceholder: {
    type: String,
    default: 'Buscar...',
  },
  searchLabel: {
    type: String,
    default: 'Buscar registros',
  },
  pageSize: {
    type: Number,
    default: 0,
  },
})

defineEmits(['update:modelValue'])

const page = ref(1)

const filteredRows = computed(() => {
  const term = props.modelValue.trim().toLocaleLowerCase()
  if (!props.searchable || !term) return props.rows

  return props.rows.filter(row =>
    props.columns.some(column =>
      formatValue(getCellValue(row, column)).toLocaleLowerCase().includes(term),
    ),
  )
})

const pageCount = computed(() =>
  props.pageSize > 0 ? Math.max(1, Math.ceil(filteredRows.value.length / props.pageSize)) : 1,
)

const visibleRows = computed(() => {
  if (props.pageSize <= 0) return filteredRows.value
  const start = (page.value - 1) * props.pageSize
  return filteredRows.value.slice(start, start + props.pageSize)
})

const firstVisible = computed(() => (page.value - 1) * props.pageSize + 1)
const lastVisible = computed(() => Math.min(page.value * props.pageSize, filteredRows.value.length))

watch(() => [props.modelValue, props.rows.length, props.pageSize], () => {
  page.value = 1
})

function getRowKey(row, index) {
  return row[props.rowKey] ?? row.id ?? index
}

function getCellValue(row, column) {
  if (typeof column.value === 'function') return column.value(row)
  return column.key.split('.').reduce((value, key) => value?.[key], row)
}

function formatValue(value) {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'object') return value.nombre || value.label || '—'
  return value
}
</script>

<style scoped>
.base-table {
  min-width: 0;
  width: 100%;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f2e9e6;
}

.table-search {
  width: min(280px, 100%);
}

.table-search input {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e9dddc;
  border-radius: 8px;
  outline: none;
  background: #fff;
  color: #503a40;
  font: inherit;
  font-size: 12px;
}

.table-search input:focus {
  border-color: #b77c8e;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  padding: 15px;
  background: #fcf7f5;
  color: #9c8288;
  font-size: 10px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 14px 15px;
  border-top: 1px solid #f3ebe8;
  color: #78666b;
  font-size: 12px;
  vertical-align: middle;
}

tbody tr:hover {
  background: #fffbf9;
}

.table-actions-cell {
  min-width: 150px;
}

.table-state {
  min-height: 180px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #9b8589;
  text-align: center;
  font-size: 13px;
}

.table-state strong {
  color: #62464e;
  font-size: 15px;
}

.table-state p {
  margin: 0;
}

.state-error {
  color: #a13e36;
}

.table-spinner {
  width: 22px;
  height: 22px;
  border: 2px solid #eadbdc;
  border-top-color: #82485b;
  border-radius: 50%;
  animation: table-spin 0.7s linear infinite;
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #f2e9e6;
  color: #89757a;
  font-size: 12px;
}

.table-pagination > div {
  display: flex;
  gap: 8px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes table-spin {
  to { transform: rotate(360deg); }
}
</style>
