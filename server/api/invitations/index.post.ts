export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: unknown }>(event, "/invitations", {
    method: "POST",
    body: await readBody(event),
    fallbackMessage: "Não foi possível criar o convite",
  });
  return res.data;
});
