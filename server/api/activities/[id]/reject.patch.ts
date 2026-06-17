export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await proxyToBackend<{ data: unknown }>(event, `/activities/${id}/reject`, {
    method: "PATCH",
    body: await readBody(event).catch(() => ({})),
    fallbackMessage: "Erro ao rejeitar atividade",
  });
  return res.data;
});
