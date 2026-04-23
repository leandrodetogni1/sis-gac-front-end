export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/activity-types", {
    method: "GET",
    query: getQuery(event),
    fallbackMessage: "Não foi possível carregar os tipos de atividade",
  });
  return res.data;
});
