export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const token = getAuthToken(event);
  const query = getQuery(event);
  const format = query.format === "pdf" ? "pdf" : "xlsx";

  try {
    const res = await $fetch.raw(`${apiUrl}/users/formandos-aptos/export?format=${format}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      responseType: "arrayBuffer",
    });

    const contentType = res.headers.get("content-type");
    const disposition = res.headers.get("content-disposition");
    if (contentType) setResponseHeader(event, "content-type", contentType);
    if (disposition) setResponseHeader(event, "content-disposition", disposition);

    return Buffer.from(res._data as ArrayBuffer);
  } catch (error: any) {
    const status = error?.statusCode ?? error?.status ?? 502;
    const message = error?.response?._data?.message ?? "Não foi possível gerar o arquivo";
    throw createError({ statusCode: status, message });
  }
});
