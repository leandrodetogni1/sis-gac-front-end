export default defineEventHandler(async (event) => {
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
    const res = await $fetch<{ data: unknown }>(`${apiUrl}/activities`, {
      method: "POST",
      body: form,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    return res.data;
  } catch (error: any) {
    const status = error?.statusCode ?? error?.status ?? 502;
    const raw = error?.response?._data?.message ?? error?.data?.message ?? "Erro ao criar atividade";
    const message = Array.isArray(raw) ? raw.join(", ") : raw;
    throw createError({ statusCode: status, message });
  }
});
