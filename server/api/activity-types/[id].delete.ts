export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  await proxyToBackend(event, `/activity-types/${id}`, {
    method: "DELETE",
    fallbackMessage: "Não foi possível remover o tipo de atividade",
  });
  return { success: true };
});
