export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const contentType = getHeader(event, "content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const { apiUrl } = useRuntimeConfig();
    const token = getAuthToken(event);
    const parts = await readMultipartFormData(event);

    const form = new FormData();
    for (const part of parts ?? []) {
      if (!part.name) continue;
      if (part.filename) {
        form.append(
          part.name,
          new Blob([part.data], { type: part.type || "application/octet-stream" }),
          part.filename,
        );
      } else {
        form.append(part.name, part.data.toString("utf-8"));
      }
    }

    try {
      const res = await $fetch<{ data: unknown }>(`${apiUrl}/activities/${id}`, {
        method: "PATCH",
        body: form,
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      return res.data;
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status ?? 502;
      const raw = error?.response?._data?.message ?? error?.data?.message ?? "Erro ao atualizar atividade";
      const message = Array.isArray(raw) ? raw.join(", ") : raw;
      throw createError({ statusCode: status, message });
    }
  }

  const res = await proxyToBackend<{ data: unknown }>(event, `/activities/${id}`, {
    method: "PATCH",
    body: await readBody(event),
    fallbackMessage: "Erro ao atualizar atividade",
  });
  return res.data;
});
