export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const body = await readBody(event);

  console.log(body);

  //   try {
  //     const res = await $fetch<{ data: unknown }>(`${apiUrl}/activities`, {
  //       method: "POST",
  //       body,
  //     });

  //     return res.data;
  //   } catch (error: any) {
  //     const status = error?.statusCode ?? error?.status ?? 502;
  //     const message = error?.data?.message ?? "Erro ao criar atividade";
  //     throw createError({
  //       statusCode: status,
  //       statusMessage: message,
  //     });
  //   }
});
