<script setup lang="ts">
const { dashboard, loading, error, getAdminDashboard } = useAdminDashboard();
const { user } = useAuthState();

const statTileCount = computed(() => {
  const role = user.value?.role;
  return role === "admin" || role === "owner" ? 5 : 3;
});

const fetchDashboard = async () => {
  await getAdminDashboard();
};

onMounted(async () => {
  await fetchDashboard();
});
</script>

<template>
  <div>
    <div v-if="loading && !dashboard" class="flex flex-col gap-6" data-testid="page-loading">
      <div :class="['grid gap-4 sm:grid-cols-2', statTileCount >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-3']">
        <SGCard v-for="i in statTileCount" :key="`stat-${i}`">
          <div class="flex items-start justify-between gap-2">
            <SGSkeleton class="h-3 w-24" />
            <SGSkeleton class="h-5 w-5 rounded-full" />
          </div>
          <SGSkeleton class="mt-2 h-8 w-16" />
        </SGCard>
      </div>

      <SGCard>
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <SGSkeleton class="h-5 w-32" />
            <SGSkeleton class="mt-2 h-3 w-64" />
          </div>
          <SGSkeleton class="h-4 w-16" />
        </div>
        <SGTableSkeleton mobile-cards :columns="5" :rows="5" />
      </SGCard>

      <SGCard>
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <SGSkeleton class="h-5 w-44" />
            <SGSkeleton class="mt-2 h-3 w-56" />
          </div>
          <SGSkeleton class="h-4 w-16" />
        </div>
        <SGTableSkeleton mobile-cards :columns="8" :rows="5" />
      </SGCard>
    </div>

    <div v-else-if="error" class="flex min-h-[60vh] items-center justify-center" data-testid="admin-dashboard-error">
      <div class="flex flex-col items-center gap-3 text-center">
        <Icon name="lucide:alert-circle" size="2rem" class="text-error-500" />
        <p class="text-sm text-neutral-700">{{ error }}</p>
        <SGButton variant="secondary" size="sm" @click="fetchDashboard">Tentar novamente</SGButton>
      </div>
    </div>

    <div v-else-if="dashboard" class="flex flex-col gap-6" data-testid="admin-dashboard">
      <dashboard-admin-stats
        :stats="dashboard.systemStats"
        :verified-count="dashboard.reviewQueue.verifiedCount"
      />

      <dashboard-admin-formandos-at-risk :formandos="dashboard.formandosAtRisk" />

      <dashboard-admin-regular-progress :students="dashboard.regularStudentsProgress" />
    </div>
  </div>
</template>
