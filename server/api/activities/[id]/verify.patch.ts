export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await proxyToBackend<{ data: unknown }>(event, `/activities/${id}/verify`, {
    method: "PATCH",
    fallbackMessage: "Erro ao verificar atividade",
  });
  return res.data;
});
