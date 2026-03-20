export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const query = getQuery(event);

  try {
    const res = await $fetch<{ data: unknown }>(`${apiUrl}/activity-types`, {
      method: "GET",
      query,
    });

    return res.data;
  } catch (error: any) {
    const status = error?.statusCode ?? error?.status ?? 502;
    throw createError({
      statusCode: status,
      message: "Não foi possível carregar os tipos de atividade",
    });
  }
});
