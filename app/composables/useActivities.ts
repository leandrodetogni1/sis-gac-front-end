import type { ActivityEventResponseDto } from "~/interfaces/ActivityEventResponseDto";
import type { ActivityResponseDto, ActivityStatus } from "~/interfaces/ActivityResponseDto";
import type { CreateActivityDto } from "~/interfaces/CreateActivityDto";
import type { MeSummaryResponseDto } from "~/interfaces/MeSummaryResponseDto";
import type { UpdateActivityDto } from "~/interfaces/UpdateActivityDto";

export type ActivityFilters = {
  status?: ActivityStatus;
};

export const useActivities = () => {
  const api = useApi();
  const activities = ref<ActivityResponseDto[]>([]);
  const loading = ref(false);
  const fetched = ref(false);
  const error = ref<string | null>(null);

  const buildQuery = (filters?: ActivityFilters) => {
    const query: Record<string, string> = {};
    if (filters?.status) query.status = filters.status;
    return query;
  };

  const getActivities = async (filters?: ActivityFilters): Promise<ActivityResponseDto[]> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<ActivityResponseDto[]>("/api/activities", {
        query: buildQuery(filters),
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

  const getMyActivities = async (filters?: ActivityFilters): Promise<ActivityResponseDto[]> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<ActivityResponseDto[]>("/api/activities/me", {
        query: buildQuery(filters),
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

  const createActivity = async (payload: CreateActivityDto): Promise<ActivityResponseDto> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<ActivityResponseDto>("/api/activities", {
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

  const updateActivity = async (id: string, payload: UpdateActivityDto): Promise<ActivityResponseDto> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<ActivityResponseDto>(`/api/activities/${id}`, {
        method: "PATCH",
        body: payload,
      });
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao atualizar atividade";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const approveActivity = async (id: string): Promise<void> => {
    await api(`/api/activities/${id}/approve`, { method: "PATCH" });
  };

  const verifyActivity = async (id: string): Promise<void> => {
    await api(`/api/activities/${id}/verify`, { method: "PATCH" });
  };

  const rejectActivity = async (id: string): Promise<void> => {
    await api(`/api/activities/${id}/reject`, { method: "PATCH" });
  };

  const getUserSummary = async (userId: string): Promise<MeSummaryResponseDto> => {
    return await api<MeSummaryResponseDto>(`/api/users/${userId}/activities/summary`);
  };

  const getActivityEvents = async (id: string): Promise<ActivityEventResponseDto[]> => {
    return await api<ActivityEventResponseDto[]>(`/api/activities/${id}/events`);
  };

  const getActivitiesByUser = async (userId: string): Promise<ActivityResponseDto[]> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<ActivityResponseDto[]>("/api/activities", {
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
    const target = status.toLowerCase();
    return activities.value.filter((a) => a.status?.toLowerCase() === target);
  };

  return {
    activities,
    loading,
    fetched,
    error,
    getActivities,
    getMyActivities,
    getActivitiesByUser,
    createActivity,
    updateActivity,
    approveActivity,
    verifyActivity,
    rejectActivity,
    getUserSummary,
    getActivityEvents,
    filterByStatus,
  };
};
