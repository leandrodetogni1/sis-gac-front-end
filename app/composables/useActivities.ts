import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";

export const useActivities = () => {
  const activities = ref<ActivityResponseDto[]>([]);
  const loading = ref(false);
  const fetched = ref(false);
  const error = ref<string | null>(null);

  const getActivities = async (): Promise<ActivityResponseDto[]> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<ActivityResponseDto[]>("/api/activities");
      activities.value = data;
      return data;
    } catch (e: any) {
      error.value = e?.data?.statusMessage ?? "Erro ao carregar atividades";
      return [];
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  const filterByStatus = (status: string): ActivityResponseDto[] => {
    return activities.value.filter((a) => a.status === status);
  };

  return {
    activities,
    loading,
    fetched,
    error,
    getActivities,
    filterByStatus,
  };
};
