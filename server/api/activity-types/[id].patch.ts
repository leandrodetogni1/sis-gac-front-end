export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  try {
    const res = await $fetch<{ data: unknown }>(`${apiUrl}/activity-types/${id}`, {
      method: "PATCH",
      body,
    });

    return res.data;
  } catch (error: any) {
    const status = error?.statusCode ?? error?.status ?? 502;
    const message = error?.response?._data?.message ?? error?.data?.message ?? "Erro ao atualizar tipo de atividade";
    throw createError({
      statusCode: status,
      message,
    });
  }
});
