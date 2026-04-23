export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/activities", {
    method: "GET",
    query: getQuery(event),
    fallbackMessage: "Não foi possível conectar à API",
  });
  return res.data;
});
