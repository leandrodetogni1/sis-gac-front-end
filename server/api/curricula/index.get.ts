export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/curricula", {
    method: "GET",
    fallbackMessage: "Não foi possível carregar os currículos",
  });
  return res.data;
});
