export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await proxyToBackend<{ data: unknown }>(event, `/activities/${id}/note`, {
    method: "PATCH",
    body: await readBody(event).catch(() => ({})),
    fallbackMessage: "Erro ao salvar nota da atividade",
  });
  return res.data;
});
