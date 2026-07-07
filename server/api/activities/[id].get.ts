import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await proxyToBackend<{ data: ActivityResponseDto }>(event, `/activities/${id}`, {
    method: "GET",
    fallbackMessage: "Não foi possível carregar a atividade",
  });
  return res.data;
});
