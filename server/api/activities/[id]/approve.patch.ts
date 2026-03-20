export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const id = getRouterParam(event, "id");

  try {
    const res = await $fetch<{ data: unknown }>(`${apiUrl}/activities/${id}/approve`, {
      method: "PATCH",
    });

    return res.data;
  } catch (error: any) {
    const status = error?.statusCode ?? error?.status ?? 502;
    const message = error?.response?._data?.message ?? error?.data?.message ?? "Erro ao aprovar atividade";
    throw createError({
      statusCode: status,
      message,
    });
  }
});
