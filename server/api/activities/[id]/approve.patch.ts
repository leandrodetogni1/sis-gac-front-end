export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await proxyToBackend<{ data: unknown }>(event, `/activities/${id}/approve`, {
    method: "PATCH",
    fallbackMessage: "Erro ao aprovar atividade",
  });
  return res.data;
});
