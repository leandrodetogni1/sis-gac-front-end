import type { AdminDashboardResponseDto } from "~/interfaces/AdminDashboardResponseDto";

export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: AdminDashboardResponseDto }>(event, "/dashboard/admin", {
    method: "GET",
    fallbackMessage: "Não foi possível carregar o painel administrativo",
  });
  return res.data;
});
