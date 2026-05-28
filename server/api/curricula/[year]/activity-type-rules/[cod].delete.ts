export default defineEventHandler(async (event) => {
  const year = getRouterParam(event, "year");
  const cod = getRouterParam(event, "cod");
  const res = await proxyToBackend<{ data: unknown }>(event, `/curricula/${year}/activity-type-rules/${cod}`, {
    method: "DELETE",
    fallbackMessage: "Erro ao remover regra do tipo de atividade",
  });
  return res.data;
});
