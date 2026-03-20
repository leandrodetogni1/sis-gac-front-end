export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const body = await readBody(event);

  try {
    const res = await $fetch<{ data: unknown }>(`${apiUrl}/users`, {
      method: "POST",
      body,
    });
    return res.data;
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode ?? 502,
      message: "Não foi possível criar o usuário",
    });
  }
});
