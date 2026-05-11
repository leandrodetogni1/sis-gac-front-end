<script setup lang="ts">
import type { AdminDashboardSystemStats } from "~/interfaces/AdminDashboardResponseDto";

const props = defineProps<{
  stats: AdminDashboardSystemStats;
  verifiedCount: number;
}>();

type Tile = {
  value: number;
  label: string;
  icon: string;
  testId: string;
  to: string;
};

const tiles = computed<Tile[]>(() => [
  {
    value: props.stats.totalUsers,
    label: "Total de alunos",
    icon: "lucide:users",
    testId: "stat-total-users",
    to: "/members",
  },
  {
    value: props.stats.totalFormandos,
    label: "Formandos",
    icon: "lucide:graduation-cap",
    testId: "stat-total-formandos",
    to: "/members?situation=FORMANDO",
  },
  {
    value: props.stats.activitiesApprovedLast30Days,
    label: "Aprovadas (30 dias)",
    icon: "lucide:check-circle-2",
    testId: "stat-approved-30d",
    to: "/activities?status=APPROVED",
  },
  {
    value: props.stats.totalActivitiesPending,
    label: "Pendentes",
    icon: "lucide:clock",
    testId: "stat-total-pending",
    to: "/activities?status=PENDING",
  },
  {
    value: props.verifiedCount,
    label: "Verificadas",
    icon: "lucide:badge-check",
    testId: "stat-total-verified",
    to: "/activities?status=VERIFIED",
  },
]);
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" data-testid="admin-stats">
    <NuxtLink
      v-for="tile in tiles"
      :key="tile.testId"
      :to="tile.to"
      :data-testid="tile.testId"
      class="group block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md md:p-6"
    >
      <div class="flex items-start justify-between gap-2">
        <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {{ tile.label }}
        </p>
        <Icon :name="tile.icon" size="1.25rem" class="text-primary-500" />
      </div>
      <div class="mt-2 flex items-end justify-between">
        <p class="text-3xl font-semibold text-neutral-900">
          {{ tile.value }}
        </p>
        <Icon
          name="lucide:arrow-up-right"
          size="1rem"
          class="text-neutral-300 transition-colors group-hover:text-primary-500"
        />
      </div>
    </NuxtLink>
  </div>
</template>
