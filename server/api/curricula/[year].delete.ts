export default defineEventHandler(async (event) => {
  const year = getRouterParam(event, "year");
  const res = await proxyToBackend<{ data: unknown }>(event, `/curricula/${year}`, {
    method: "DELETE",
    fallbackMessage: "Erro ao remover currículo",
  });
  return res.data;
});
