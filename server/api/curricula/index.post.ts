export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/curricula", {
    method: "POST",
    body: await readBody(event),
    fallbackMessage: "Erro ao criar currículo",
  });
  return res.data;
});
