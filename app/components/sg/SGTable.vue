<script setup lang="ts">
import type { SGTableColumn } from "~/types/SGTableColumn";

const props = defineProps<{
  columns: SGTableColumn[];
  items: any[];
  itemKey?: string;
  loading?: boolean;
  error?: string | null;
  errorText?: string;
  emptyText?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  clickable?: boolean;
  hoverable?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  testId?: string;
}>();

const emit = defineEmits(["row-click", "retry", "sort"]);

const slots = defineSlots<{
  [key: `cell-${string}`]: (props: { item: any; index: number }) => any;
  mobile?: (props: { item: any; index: number }) => any;
  footer?: () => any;
  "empty-action"?: () => any;
}>();

const resolvedItemKey = computed(() => props.itemKey ?? "id");
const resolvedHoverable = computed(() => props.hoverable ?? true);

const getItemKey = (item: any, index: number) => {
  return item[resolvedItemKey.value] ?? index;
};

const getCellValue = (item: any, key: string) => {
  return item[key] ?? "—";
};

const thClass = (col: SGTableColumn, isLast: boolean) => {
  const base = "pb-3";
  const padding = isLast ? "" : " pr-4";
  const align = col.align === "right" ? " text-right" : col.align === "center" ? " text-center" : "";
  return base + padding + align;
};

const tdClass = (col: SGTableColumn, isLast: boolean) => {
  const base = "py-3";
  const padding = isLast ? "" : " pr-4";
  const align = col.align === "right" ? " text-right" : col.align === "center" ? " text-center" : "";
  return base + padding + align;
};

const hasMobileSlot = computed(() => !!slots.mobile);

const SKELETON_WIDTHS = ["w-32", "w-20", "w-24", "w-16", "w-28"];

const skeletonWidth = (row: number, col: number) => {
  return SKELETON_WIDTHS[(row + col) % SKELETON_WIDTHS.length];
};

const skeletonAlign = (col: SGTableColumn) => {
  if (col.align === "right") return "ml-auto";
  if (col.align === "center") return "mx-auto";
  return "";
};

const sortIcon = (col: SGTableColumn) => {
  if (col.sortKey !== props.sortBy) return "lucide:chevrons-up-down";
  return props.sortOrder === "desc" ? "lucide:chevron-down" : "lucide:chevron-up";
};
</script>

<template>
  <div v-if="loading" data-testid="table-loading">
    <div :class="hasMobileSlot ? 'hidden overflow-x-auto md:block' : 'overflow-x-auto'">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-neutral-200 text-xs font-medium uppercase text-neutral-500">
            <th v-for="(col, i) in columns" :key="col.key" :class="thClass(col, i === columns.length - 1)">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in 5" :key="row" class="border-b border-neutral-100">
            <td v-for="(col, i) in columns" :key="col.key" :class="tdClass(col, i === columns.length - 1)">
              <SGSkeleton class="h-4" :class="[skeletonWidth(row, i), skeletonAlign(col)]" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="hasMobileSlot" class="space-y-3 md:hidden">
      <div v-for="row in 5" :key="row" class="rounded-lg border border-neutral-200 p-3">
        <div class="flex items-center gap-2.5">
          <SGSkeleton class="h-8 w-8 rounded-full" />
          <div class="flex-1">
            <SGSkeleton class="h-4 w-32" />
            <SGSkeleton class="mt-1.5 h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="error" class="flex flex-col items-center justify-center py-12" data-testid="table-error">
    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-error-50">
      <Icon name="lucide:wifi-off" size="2rem" class="text-error-400" />
    </div>
    <p class="mt-4 text-sm font-medium text-neutral-900">{{ errorText ?? "Falha ao carregar dados" }}</p>
    <p class="mt-1 text-sm text-neutral-500">{{ error }}</p>
    <SGButton test-id="table-retry-button" variant="primary" icon="lucide:refresh-cw" size="sm" class="mt-4" @click="emit('retry')">
      Tentar novamente
    </SGButton>
  </div>

  <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center py-12" data-testid="table-empty">
    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
      <Icon :name="emptyIcon ?? 'lucide:inbox'" size="2rem" class="text-neutral-400" />
    </div>
    <p class="mt-4 text-sm font-medium text-neutral-900">{{ emptyText ?? "Nenhum item encontrado" }}</p>
    <p v-if="emptyDescription" class="mt-1 text-sm text-neutral-500">{{ emptyDescription }}</p>
    <div v-if="$slots['empty-action']" class="mt-4">
      <slot name="empty-action" />
    </div>
  </div>

  <div v-else>
    <div :class="hasMobileSlot ? 'hidden overflow-x-auto md:block' : 'overflow-x-auto'">
      <table class="w-full text-left text-sm" :data-testid="testId">
        <thead>
          <tr class="border-b border-neutral-200 text-xs font-medium uppercase text-neutral-500">
            <th v-for="(col, i) in columns" :key="col.key" :class="thClass(col, i === columns.length - 1)">
              <button
                v-if="col.sortKey"
                type="button"
                class="inline-flex cursor-pointer items-center gap-1 uppercase transition-colors hover:text-neutral-700"
                :class="col.align === 'right' ? 'flex-row-reverse' : ''"
                :data-testid="testId ? `${testId}-sort-${col.key}` : undefined"
                @click="emit('sort', col.sortKey)"
              >
                <span>{{ col.label }}</span>
                <Icon
                  :name="sortIcon(col)"
                  size="0.875rem"
                  :class="col.sortKey === sortBy ? 'text-neutral-700' : 'text-neutral-300'"
                />
              </button>
              <template v-else>{{ col.label }}</template>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in items"
            :key="getItemKey(item, index)"
            class="border-b border-neutral-100 transition-colors"
            :class="[
              resolvedHoverable ? 'hover:bg-neutral-50' : '',
              clickable ? 'cursor-pointer' : '',
            ]"
            :data-testid="testId ? `${testId}-row-${getItemKey(item, index)}` : undefined"
            @click="clickable ? emit('row-click', item) : undefined"
          >
            <td
              v-for="(col, i) in columns"
              :key="col.key"
              :class="tdClass(col, i === columns.length - 1)"
            >
              <slot :name="`cell-${col.key}`" :item="item" :index="index">
                {{ getCellValue(item, col.key) }}
              </slot>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="$slots.footer">
          <slot name="footer" />
        </tfoot>
      </table>
    </div>

    <div v-if="hasMobileSlot" class="space-y-3 md:hidden">
      <div
        v-for="(item, index) in items"
        :key="getItemKey(item, index)"
        class="rounded-lg border border-neutral-200 p-3"
        :class="clickable ? 'cursor-pointer' : ''"
        :data-testid="testId ? `${testId}-card-${getItemKey(item, index)}` : undefined"
        @click="clickable ? emit('row-click', item) : undefined"
      >
        <slot name="mobile" :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>
