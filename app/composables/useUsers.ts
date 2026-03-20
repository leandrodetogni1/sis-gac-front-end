import type { UserResponseDto } from "~/interfaces/UserResponseDto";
import type { CreateUserDto } from "~/interfaces/CreateUserDto";

export const useUsers = () => {
  const users = ref<UserResponseDto[]>([]);
  const loading = ref(false);
  const fetched = ref(false);
  const error = ref<string | null>(null);

  const getUsers = async (): Promise<UserResponseDto[]> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<UserResponseDto[]>("/api/users");
      users.value = data;
      return data;
    } catch (e: any) {
      error.value = e?.data?.statusMessage ?? "Erro ao carregar usuários";
      return [];
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  const createUser = async (payload: CreateUserDto): Promise<UserResponseDto> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<UserResponseDto>("/api/users", {
        method: "POST",
        body: payload,
      });
      await getUsers();
      return data;
    } catch (e: any) {
      error.value = e?.data?.statusMessage ?? "Erro ao criar usuário";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await $fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      await getUsers();
    } catch (e: any) {
      error.value = e?.data?.statusMessage ?? "Erro ao remover usuário";
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
    createUser,
    deleteUser,
  };
};
