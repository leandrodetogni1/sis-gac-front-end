import type { ActivityEventResponseDto } from "~/interfaces/ActivityEventResponseDto";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const res = await proxyToBackend<{ data: ActivityEventResponseDto[] }>(
    event,
    `/activities/${id}/events`,
    {
      method: "GET",
      fallbackMessage: "Não foi possível carregar o histórico",
    },
  );
  return res.data;
});
