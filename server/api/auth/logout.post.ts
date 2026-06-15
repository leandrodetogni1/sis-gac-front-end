export default defineEventHandler(async (event) => {
  await proxyToBackend(event, "/auth/logout", {
    method: "POST",
    fallbackMessage: "Erro ao registrar logout",
  }).catch(() => undefined);

  deleteCookie(event, "auth_token", { path: "/" });
  return { ok: true };
});
