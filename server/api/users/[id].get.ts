export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const id = getRouterParam(event, "id");

  try {
    const res = await $fetch<{ data: unknown }>(`${apiUrl}/users/${id}`, {
      method: "GET",
    });
    return res.data;
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode ?? 502,
      message: "Não foi possível carregar o usuário",
    });
  }
});
