export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/users", {
    method: "GET",
    query: getQuery(event),
    fallbackMessage: "Não foi possível carregar os usuários",
  });
  return res.data;
});
