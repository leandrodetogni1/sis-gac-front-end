import type { AdminDashboardResponseDto } from "~/interfaces/AdminDashboardResponseDto";

export const useAdminDashboard = () => {
  const api = useApi();
  const dashboard = ref<AdminDashboardResponseDto | null>(null);
  const loading = ref(false);
  const fetched = ref(false);
  const error = ref<string | null>(null);

  const getAdminDashboard = async (): Promise<AdminDashboardResponseDto | null> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<AdminDashboardResponseDto>("/api/dashboard/admin");
      dashboard.value = data;
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar painel administrativo";
      return null;
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  return {
    dashboard,
    loading,
    fetched,
    error,
    getAdminDashboard,
  };
};
