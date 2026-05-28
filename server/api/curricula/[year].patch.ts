export default defineEventHandler(async (event) => {
  const year = getRouterParam(event, "year");
  const res = await proxyToBackend<{ data: unknown }>(event, `/curricula/${year}`, {
    method: "PATCH",
    body: await readBody(event),
    fallbackMessage: "Erro ao atualizar currículo",
  });
  return res.data;
});
