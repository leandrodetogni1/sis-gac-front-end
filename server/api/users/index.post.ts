export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/users", {
    method: "POST",
    body: await readBody(event),
    fallbackMessage: "Não foi possível criar o usuário",
  });
  return res.data;
});
