import type { UserResponseDto } from "~/interfaces/UserResponseDto";

export default defineEventHandler(async (event) => {
  const { idToken } = await readBody<{ idToken: string }>(event);

  if (!idToken) {
    throw createError({ statusCode: 400, message: "idToken é obrigatório" });
  }

  const res = await proxyToBackend<{ data: { token: string; user: UserResponseDto } }>(
    event,
    "/auth/google",
    {
      method: "POST",
      body: { idToken },
      fallbackMessage: "Não foi possível autenticar com o Google",
    },
  );

  const { token, user } = res.data;

  setCookie(event, "auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return { user };
});
