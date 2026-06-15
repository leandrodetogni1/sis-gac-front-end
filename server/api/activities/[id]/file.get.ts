export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig();
  const token = getAuthToken(event);
  const id = getRouterParam(event, "id");

  try {
    const res = await $fetch.raw(`${apiUrl}/activities/${id}/file`, {
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
    const raw = error?.response?._data?.message ?? "Não foi possível obter o arquivo";
    const message = Array.isArray(raw) ? raw.join(", ") : raw;
    throw createError({ statusCode: status, message });
  }
});
