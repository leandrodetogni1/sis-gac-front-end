import type { ActivityEventResponseDto } from "~/interfaces/ActivityEventResponseDto";
import type { ActivityResponseDto, ActivityStatus, CreateActivityResponseDto } from "~/interfaces/ActivityResponseDto";
import type { CreateActivityDto } from "~/interfaces/CreateActivityDto";
import type { MeSummaryResponseDto } from "~/interfaces/MeSummaryResponseDto";
import type { PaginatedActivities } from "~/interfaces/PaginatedActivities";
import type { UpdateActivityDto } from "~/interfaces/UpdateActivityDto";

export type ActivitySortBy = "createdAt" | "status" | "hoursEquivalent";

export type ActivityFilters = {
  category?: string;
  status?: ActivityStatus;
  authorId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: ActivitySortBy;
  sortOrder?: "asc" | "desc";
};

export const useActivities = () => {
  const api = useApi();
  const activities = ref<ActivityResponseDto[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(20);
  const totalPages = ref(1);
  const loading = ref(false);
  const fetched = ref(false);
  const error = ref<string | null>(null);

  const buildQuery = (filters?: ActivityFilters) => {
    const query: Record<string, string> = {};
    if (filters?.category) query.category = filters.category;
    if (filters?.status) query.status = filters.status;
    if (filters?.authorId) query.authorId = filters.authorId;
    if (filters?.sortBy) query.sortBy = filters.sortBy;
    if (filters?.sortOrder) query.sortOrder = filters.sortOrder;
    if (filters?.page) query.page = String(filters.page);
    if (filters?.pageSize) query.pageSize = String(filters.pageSize);
    return query;
  };

  const toPage = (data: unknown, filters?: ActivityFilters): PaginatedActivities => {
    if (Array.isArray(data)) {
      return {
        items: data as ActivityResponseDto[],
        total: data.length,
        page: 1,
        pageSize: filters?.pageSize ?? (data.length || pageSize.value),
        totalPages: 1,
      };
    }
    const obj = (data ?? {}) as Partial<PaginatedActivities>;
    const items = Array.isArray(obj.items) ? obj.items : [];
    return {
      items,
      total: typeof obj.total === "number" ? obj.total : items.length,
      page: typeof obj.page === "number" ? obj.page : filters?.page ?? 1,
      pageSize: typeof obj.pageSize === "number" ? obj.pageSize : filters?.pageSize ?? pageSize.value,
      totalPages: typeof obj.totalPages === "number" ? obj.totalPages : 1,
    };
  };

  const applyPage = (result: PaginatedActivities) => {
    activities.value = result.items;
    total.value = result.total;
    page.value = result.page;
    pageSize.value = result.pageSize;
    totalPages.value = result.totalPages;
  };

  const emptyPage = (filters?: ActivityFilters): PaginatedActivities => ({
    items: [],
    total: 0,
    page: filters?.page ?? 1,
    pageSize: filters?.pageSize ?? pageSize.value,
    totalPages: 1,
  });

  const getActivities = async (filters?: ActivityFilters): Promise<PaginatedActivities> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<unknown>("/api/activities", {
        query: buildQuery(filters),
      });
      const result = toPage(data, filters);
      applyPage(result);
      return result;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar atividades";
      activities.value = [];
      return emptyPage(filters);
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  const getMyActivities = async (filters?: ActivityFilters): Promise<PaginatedActivities> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<unknown>("/api/activities/me", {
        query: buildQuery(filters),
      });
      const result = toPage(data, filters);
      applyPage(result);
      return result;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar atividades";
      activities.value = [];
      return emptyPage(filters);
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  const createActivity = async (
    payload: CreateActivityDto,
    file?: File | null,
  ): Promise<ActivityResponseDto> => {
    loading.value = true;
    error.value = null;
    try {
      const fd = new FormData();
      fd.append("activityTypeId", payload.activityTypeId);
      fd.append("class", payload.class);
      fd.append("event", payload.event);
      fd.append("startDate", payload.startDate);
      fd.append("endDate", payload.endDate);
      if (payload.organization) fd.append("organization", payload.organization);
      if (payload.hours !== undefined && payload.hours !== null) fd.append("hours", String(payload.hours));
      if (payload.certificateUrl) fd.append("certificateUrl", payload.certificateUrl);
      if (file) fd.append("file", file);

      const data = await api<CreateActivityResponseDto>("/api/activities", {
        method: "POST",
        body: fd,
      });
      return data.activity;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao criar atividade";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateActivity = async (
    id: string,
    payload: UpdateActivityDto,
    options?: { file?: File | null; removeFile?: boolean },
  ): Promise<ActivityResponseDto> => {
    loading.value = true;
    error.value = null;
    try {
      let body: FormData | (UpdateActivityDto & { removeFile?: boolean }) = payload;
      if (options?.file) {
        const fd = new FormData();
        for (const [key, value] of Object.entries(payload)) {
          if (value !== undefined && value !== null) fd.append(key, String(value));
        }
        fd.append("file", options.file);
        body = fd;
      } else if (options?.removeFile) {
        body = { ...payload, removeFile: true };
      }

      const data = await api<ActivityResponseDto>(`/api/activities/${id}`, {
        method: "PATCH",
        body,
      });
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao atualizar atividade";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteActivity = async (id: string): Promise<void> => {
    await api(`/api/activities/${id}`, { method: "DELETE" });
  };

  const approveActivity = async (id: string): Promise<void> => {
    await api(`/api/activities/${id}/approve`, { method: "PATCH" });
  };

  const verifyActivity = async (id: string): Promise<void> => {
    await api(`/api/activities/${id}/verify`, { method: "PATCH" });
  };

  const rejectActivity = async (id: string, comment?: string): Promise<void> => {
    await api(`/api/activities/${id}/reject`, {
      method: "PATCH",
      body: comment ? { comment } : {},
    });
  };

  const getUserSummary = async (userId: string): Promise<MeSummaryResponseDto> => {
    return await api<MeSummaryResponseDto>(`/api/users/${userId}/activities/summary`);
  };

  const getActivityEvents = async (id: string): Promise<ActivityEventResponseDto[]> => {
    return await api<ActivityEventResponseDto[]>(`/api/activities/${id}/events`);
  };

  const getActivitiesByUser = async (
    userId: string,
    filters?: ActivityFilters,
  ): Promise<PaginatedActivities> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<unknown>("/api/activities", {
        query: buildQuery({ ...filters, authorId: userId }),
      });
      const result = toPage(data, filters);
      applyPage(result);
      return result;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar atividades";
      activities.value = [];
      return emptyPage(filters);
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
    total,
    page,
    pageSize,
    totalPages,
    loading,
    fetched,
    error,
    getActivities,
    getMyActivities,
    getActivitiesByUser,
    createActivity,
    updateActivity,
    deleteActivity,
    approveActivity,
    verifyActivity,
    rejectActivity,
    getUserSummary,
    getActivityEvents,
    filterByStatus,
  };
};
