export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/activities", {
    method: "POST",
    body: await readBody(event),
    fallbackMessage: "Erro ao criar atividade",
  });
  return res.data;
});
