import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";
import type { CreateActivityDto } from "~/interfaces/CreateActivityDto";

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
      error.value = e?.data?.message ?? "Erro ao carregar atividades";
      return [];
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  const createActivity = async (payload: CreateActivityDto): Promise<ActivityResponseDto> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<ActivityResponseDto>("/api/activities", {
        method: "POST",
        body: payload,
      });
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao criar atividade";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const approveActivity = async (id: string): Promise<void> => {
    await $fetch(`/api/activities/${id}/approve`, { method: "PATCH" });
  };

  const verifyActivity = async (id: string): Promise<void> => {
    await $fetch(`/api/activities/${id}/verify`, { method: "PATCH" });
  };

  const rejectActivity = async (id: string): Promise<void> => {
    await $fetch(`/api/activities/${id}/reject`, { method: "PATCH" });
  };

  const getActivitiesByUser = async (userId: string): Promise<ActivityResponseDto[]> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<ActivityResponseDto[]>("/api/activities", {
        query: { authorId: userId },
      });
      activities.value = data;
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar atividades";
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
    getActivitiesByUser,
    createActivity,
    approveActivity,
    verifyActivity,
    rejectActivity,
    filterByStatus,
  };
};
