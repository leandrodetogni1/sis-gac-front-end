import type { UserResponseDto } from "~/interfaces/UserResponseDto";
import type { PaginatedUsers } from "~/interfaces/PaginatedUsers";
import type { FormandosAptosResponseDto } from "~/interfaces/FormandoAptoResponseDto";

export interface UserFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "firstName" | "lastName" | "email" | "matricula" | "createdAt" | "situation";
  sortOrder?: "asc" | "desc";
  role?: string;
  course?: string;
  situation?: string;
}

export const useUsers = () => {
  const api = useApi();
  const users = ref<UserResponseDto[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(20);
  const totalPages = ref(1);
  const loading = ref(false);
  const fetched = ref(false);
  const error = ref<string | null>(null);

  const getUsers = async (filters: UserFilters = {}): Promise<PaginatedUsers> => {
    loading.value = true;
    error.value = null;
    try {
      const query: Record<string, string> = {};
      if (filters.search) query.search = filters.search;
      if (filters.role) query.role = filters.role;
      if (filters.course) query.course = filters.course;
      if (filters.situation) query.situation = filters.situation;
      if (filters.sortBy) query.sortBy = filters.sortBy;
      if (filters.sortOrder) query.sortOrder = filters.sortOrder;
      if (filters.page) query.page = String(filters.page);
      if (filters.pageSize) query.pageSize = String(filters.pageSize);

      const data = await api<PaginatedUsers>("/api/users", {
        query: Object.keys(query).length ? query : undefined,
      });
      users.value = data.items;
      total.value = data.total;
      page.value = data.page;
      pageSize.value = data.pageSize;
      totalPages.value = data.totalPages;
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar usuários";
      users.value = [];
      return {
        items: [],
        total: 0,
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? pageSize.value,
        totalPages: 1,
      };
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  const getUser = async (id: string): Promise<UserResponseDto | null> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<UserResponseDto>(`/api/users/${id}`);
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar usuário";
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await api(`/api/users/${id}`, {
        method: "DELETE",
      });
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao remover usuário";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getFormandosAptos = async (): Promise<FormandosAptosResponseDto> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<FormandosAptosResponseDto>("/api/users/formandos-aptos");
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar formandos aptos";
      return { items: [], total: 0 };
    } finally {
      loading.value = false;
    }
  };

  const patchUser = async (
    id: string,
    payload: {
      matricula?: number;
      course?: string;
      curriculumYear?: number;
      situation?: string;
      picture?: string;
    },
  ): Promise<UserResponseDto> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<UserResponseDto>(`/api/users/${id}`, {
        method: "PATCH",
        body: payload,
      });
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao atualizar usuário";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    users,
    total,
    page,
    pageSize,
    totalPages,
    loading,
    fetched,
    error,
    getUsers,
    getUser,
    deleteUser,
    patchUser,
    getFormandosAptos,
  };
};
