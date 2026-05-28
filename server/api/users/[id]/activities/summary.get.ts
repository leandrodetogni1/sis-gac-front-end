import type { MeSummaryResponseDto } from "~/interfaces/MeSummaryResponseDto";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await proxyToBackend<{ data: MeSummaryResponseDto }>(event, `/users/${id}/activities/summary`, {
    method: "GET",
    query: getQuery(event),
    fallbackMessage: "Não foi possível carregar o resumo",
  });
  return res.data;
});
