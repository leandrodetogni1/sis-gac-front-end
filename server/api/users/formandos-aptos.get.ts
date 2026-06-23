export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/users/formandos-aptos", {
    method: "GET",
    fallbackMessage: "Não foi possível carregar os formandos aptos",
  });
  return res.data;
});
