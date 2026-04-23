export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/activity-types", {
    method: "POST",
    body: await readBody(event),
    fallbackMessage: "Erro ao criar tipo de atividade",
  });
  return res.data;
});
