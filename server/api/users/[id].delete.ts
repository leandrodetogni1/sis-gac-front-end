export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const id = getRouterParam(event, "id");

  try {
    await $fetch(`${apiUrl}/users/${id}`, {
      method: "DELETE",
    });
    return { success: true };
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode ?? 502,
      statusMessage: "Não foi possível remover o usuário",
    });
  }
});
