import type { UserResponseDto } from "~/interfaces/UserResponseDto";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await proxyToBackend<{ data: UserResponseDto }>(event, `/users/${id}`, {
    method: "PATCH",
    body: await readBody(event),
    fallbackMessage: "Não foi possível atualizar o usuário",
  });
  return res.data;
});
