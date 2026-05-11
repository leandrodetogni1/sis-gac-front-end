export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await proxyToBackend<{ data: unknown }>(event, `/activities/${id}`, {
    method: "PATCH",
    body: await readBody(event),
    fallbackMessage: "Erro ao atualizar atividade",
  });
  return res.data;
});
