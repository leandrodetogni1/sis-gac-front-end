import type { UserResponseDto } from "~/interfaces/UserResponseDto";

export const useUsers = () => {
  const api = useApi();
  const users = ref<UserResponseDto[]>([]);
  const loading = ref(false);
  const fetched = ref(false);
  const error = ref<string | null>(null);

  const getUsers = async (filters?: {
    role?: string;
    course?: string;
  }): Promise<UserResponseDto[]> => {
    loading.value = true;
    error.value = null;
    try {
      const query: Record<string, string> = {};
      if (filters?.role) query.role = filters.role;
      if (filters?.course) query.course = filters.course;
      const data = await api<UserResponseDto[]>("/api/users", {
        query: Object.keys(query).length ? query : undefined,
      });
      users.value = data;
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar usuários";
      return [];
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
      await getUsers();
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao remover usuário";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const patchUser = async (
    id: string,
    payload: {
      matricula?: number;
      course?: string;
      curriculumYear?: string;
      situation?: string;
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
    loading,
    fetched,
    error,
    getUsers,
    getUser,
    deleteUser,
    patchUser,
  };
};
