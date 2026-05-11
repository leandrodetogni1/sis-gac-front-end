<script setup lang="ts">
import type { ActivityResponseDto, ActivityStatus } from "~/interfaces/ActivityResponseDto";

useHead({ title: "Atividades — SWGAC" });

const { user } = useAuthState();
const { activities, fetched, error, getActivities } = useActivities();

if (user.value?.role === "member") {
  await navigateTo("/activities/me");
}

const selectedActivity = ref<ActivityResponseDto | null>(null);
const modalOpen = ref(false);

const statusFilter = ref<ActivityStatus | "ALL">("ALL");
const statusOptions = [
  { label: "Todos os status", value: "ALL" },
  { label: "Pendente", value: "PENDING" },
  { label: "Verificado", value: "VERIFIED" },
  { label: "Aprovado", value: "APPROVED" },
  { label: "Rejeitado", value: "REJECTED" },
];

const fetchActivities = async () => {
  await getActivities({
    status: statusFilter.value === "ALL" ? undefined : statusFilter.value,
  });
};

const onSelect = (activity: ActivityResponseDto) => {
  selectedActivity.value = activity;
  modalOpen.value = true;
};

const onStatusChanged = async () => {
  modalOpen.value = false;
  await fetchActivities();
};

watch(statusFilter, fetchActivities);

onMounted(fetchActivities);
</script>

<template>
  <div>
    <div v-if="!fetched" class="flex min-h-[60vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando dados...</p>
      </div>
    </div>

    <div v-else>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Atividades Complementares</h2>
      </div>

      <div class="mb-4 flex flex-wrap items-center gap-3">
        <div class="w-full sm:w-56">
          <SGSelect
            v-model="statusFilter"
            placeholder="Filtrar por status"
            :options="statusOptions"
            test-id="filter-status"
          />
        </div>
      </div>

      <activities-list :activities="activities" :error="error" :can-create="false" @retry="fetchActivities" @select="onSelect" />
    </div>

    <activities-detail-modal
      v-model:open="modalOpen"
      :activity="selectedActivity"
      @approved="onStatusChanged"
      @verified="onStatusChanged"
      @rejected="onStatusChanged"
    />
  </div>
</template>
