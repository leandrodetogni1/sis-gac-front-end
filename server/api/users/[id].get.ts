export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await proxyToBackend<{ data: unknown }>(event, `/users/${id}`, {
    method: "GET",
    fallbackMessage: "Não foi possível carregar o usuário",
  });
  return res.data;
});
