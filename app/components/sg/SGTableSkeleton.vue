<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    columns?: number;
    rows?: number;
    alignLastRight?: boolean;
    mobileCards?: boolean;
  }>(),
  { columns: 4, rows: 5, alignLastRight: true, mobileCards: false },
);

const widths = ["w-32", "w-20", "w-24", "w-16", "w-28"];

const cellWidth = (row: number, col: number) => widths[(row + col) % widths.length];

const alignClass = (col: number) => {
  return props.alignLastRight && col === props.columns ? "ml-auto" : "";
};
</script>

<template>
  <div data-testid="table-skeleton">
    <div :class="mobileCards ? 'hidden overflow-x-auto md:block' : 'overflow-x-auto'">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-neutral-200">
            <th v-for="col in columns" :key="col" class="pb-3" :class="col < columns ? 'pr-4' : ''">
              <SGSkeleton class="h-3 w-16" :class="alignClass(col)" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row" class="border-b border-neutral-100">
            <td v-for="col in columns" :key="col" class="py-3" :class="col < columns ? 'pr-4' : ''">
              <SGSkeleton class="h-4" :class="[cellWidth(row, col), alignClass(col)]" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mobileCards" class="space-y-3 md:hidden">
      <div v-for="row in rows" :key="row" class="rounded-lg border border-neutral-200 p-3">
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
</template>
