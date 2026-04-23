import type { UserResponseDto } from "~/interfaces/UserResponseDto";

export default defineEventHandler(async (event) => {
  const res = await proxyToBackend<{ data: UserResponseDto }>(event, "/auth/me", {
    method: "GET",
    fallbackMessage: "Sessão inválida",
  });
  return res.data;
});
