export default defineEventHandler(async (event) => {
  const year = getRouterParam(event, "year");
  const res = await proxyToBackend<{ data: unknown }>(event, `/curricula/${year}`, {
    method: "GET",
    fallbackMessage: "Não foi possível carregar o currículo",
  });
  return res.data;
});
