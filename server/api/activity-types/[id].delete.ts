export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const id = getRouterParam(event, "id");

  try {
    await $fetch(`${apiUrl}/activity-types/${id}`, {
      method: "DELETE",
    });
    return { success: true };
  } catch (error: any) {
    const status = error?.statusCode ?? error?.status ?? 502;
    const message = error?.response?._data?.message ?? error?.data?.message ?? "Não foi possível remover o tipo de atividade";
    throw createError({
      statusCode: status,
      message,
    });
  }
});
