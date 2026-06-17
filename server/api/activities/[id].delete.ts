export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  await proxyToBackend(event, `/activities/${id}`, {
    method: "DELETE",
    fallbackMessage: "Erro ao excluir atividade",
  });
  return { success: true };
});
