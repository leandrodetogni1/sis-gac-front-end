export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  await proxyToBackend(event, `/users/${id}`, {
    method: "DELETE",
    fallbackMessage: "Não foi possível remover o usuário",
  });
  return { success: true };
});
