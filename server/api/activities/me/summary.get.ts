import type { MeSummaryResponseDto } from "~/interfaces/MeSummaryResponseDto";

export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: MeSummaryResponseDto }>(event, "/activities/me/summary", {
    method: "GET",
    query: getQuery(event),
    fallbackMessage: "Não foi possível carregar o resumo",
  });
  return res.data;
});
