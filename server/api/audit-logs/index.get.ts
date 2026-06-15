export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/audit-logs", {
    method: "GET",
    query: getQuery(event),
    fallbackMessage: "Não foi possível carregar os logs de auditoria",
  });
  return res.data;
});
