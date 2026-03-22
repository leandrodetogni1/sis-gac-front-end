<script setup lang="ts">
import type { SGTableColumn } from "~/types/SGTableColumn";

const props = defineProps<{
  columns: SGTableColumn[];
  items: any[];
  itemKey?: string;
  loading?: boolean;
  error?: string | null;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  clickable?: boolean;
  hoverable?: boolean;
  testId?: string;
}>();

const emit = defineEmits(["row-click", "retry"]);

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
</script>

<template>
  <div v-if="loading" class="flex min-h-[40vh] items-center justify-center" data-testid="table-loading">
    <div class="flex flex-col items-center gap-4">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
      <p class="text-sm text-neutral-500">{{ loadingText ?? "Carregando dados..." }}</p>
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
              {{ col.label }}
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
