import type { ActivityTypeResponseDto } from "~/interfaces/ActivityTypeResponseDto";

export const useActivityTypes = () => {
  const activityTypes = ref<ActivityTypeResponseDto[]>([]);
  const loading = ref(false);
  const fetched = ref(false);
  const error = ref<string | null>(null);

  const getActivityTypes = async (): Promise<ActivityTypeResponseDto[]> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<ActivityTypeResponseDto[]>("/api/activity-types");
      activityTypes.value = data;
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar tipos de atividade";
      return [];
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  return {
    activityTypes,
    loading,
    fetched,
    error,
    getActivityTypes,
  };
};
