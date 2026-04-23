export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await proxyToBackend<{ data: unknown }>(event, `/activity-types/${id}`, {
    method: "PATCH",
    body: await readBody(event),
    fallbackMessage: "Erro ao atualizar tipo de atividade",
  });
  return res.data;
});
