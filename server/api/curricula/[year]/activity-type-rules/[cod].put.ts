export default defineEventHandler(async (event) => {
  const year = getRouterParam(event, "year");
  const cod = getRouterParam(event, "cod");
  const res = await proxyToBackend<{ data: unknown }>(event, `/curricula/${year}/activity-type-rules/${cod}`, {
    method: "PUT",
    body: await readBody(event),
    fallbackMessage: "Erro ao salvar regra do tipo de atividade",
  });
  return res.data;
});
