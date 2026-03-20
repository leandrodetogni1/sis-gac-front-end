export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const query = getQuery(event);

  try {
    const res = await $fetch<{ data: unknown }>(`${apiUrl}/users`, {
      method: "GET",
      query,
    });
    return res.data;
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode ?? 502,
      message: "Não foi possível carregar os usuários",
    });
  }
});
