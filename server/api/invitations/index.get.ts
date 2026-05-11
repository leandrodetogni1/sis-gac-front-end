export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/invitations", {
    method: "GET",
    fallbackMessage: "Não foi possível carregar os convites",
  });
  return res.data;
});
