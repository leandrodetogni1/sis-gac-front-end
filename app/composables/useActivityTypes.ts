import type { ActivityTypeResponseDto } from "~/interfaces/ActivityTypeResponseDto";
import type { CreateActivityTypeDto } from "~/interfaces/CreateActivityTypeDto";
import type { UpdateActivityTypeDto } from "~/interfaces/UpdateActivityTypeDto";

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

  const createActivityType = async (payload: CreateActivityTypeDto): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await $fetch("/api/activity-types", {
        method: "POST",
        body: payload,
      });
      await getActivityTypes();
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao criar tipo de atividade";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateActivityType = async (id: string, payload: UpdateActivityTypeDto): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await $fetch(`/api/activity-types/${id}`, {
        method: "PATCH",
        body: payload,
      });
      await getActivityTypes();
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao atualizar tipo de atividade";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteActivityType = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await $fetch(`/api/activity-types/${id}`, {
        method: "DELETE",
      });
      await getActivityTypes();
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao remover tipo de atividade";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    activityTypes,
    loading,
    fetched,
    error,
    getActivityTypes,
    createActivityType,
    updateActivityType,
    deleteActivityType,
  };
};
