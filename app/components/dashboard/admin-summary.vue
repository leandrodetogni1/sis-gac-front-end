<script setup lang="ts">
const { dashboard, loading, error, getAdminDashboard } = useAdminDashboard();

const fetchDashboard = async () => {
  await getAdminDashboard();
};

onMounted(async () => {
  await fetchDashboard();
});
</script>

<template>
  <div>
    <div v-if="loading && !dashboard" class="flex min-h-[60vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando painel...</p>
      </div>
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
