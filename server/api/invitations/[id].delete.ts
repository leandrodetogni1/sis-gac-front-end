export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  await proxyToBackend(event, `/invitations/${id}`, {
    method: "DELETE",
    fallbackMessage: "Não foi possível revogar o convite",
  });
  return { success: true };
});
