<script setup lang="ts">
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";

useHead({ title: "Atividades — SWGAC" });

const { activities, fetched, error, getActivities } = useActivities();

const selectedActivity = ref<ActivityResponseDto | null>(null);
const modalOpen = ref(false);

const onSelect = (activity: ActivityResponseDto) => {
  selectedActivity.value = activity;
  modalOpen.value = true;
};

const onStatusChanged = async () => {
  modalOpen.value = false;
  await getActivities();
};

onMounted(async () => {
  await getActivities();
});
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
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Atividades Complementares</h2>
        <SGButton test-id="create-activity-button" variant="primary" icon="lucide:plus" @click="navigateTo('/activities/create')">
          Nova Atividade
        </SGButton>
      </div>

      <activities-list :activities="activities" :error="error" @retry="getActivities()" @select="onSelect" />
    </div>

    <activities-detail-modal
      v-model:open="modalOpen"
      :activity="selectedActivity"
      @approved="onStatusChanged"
      @rejected="onStatusChanged"
    />
  </div>
</template>
