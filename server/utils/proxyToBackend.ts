import type { H3Event } from "h3";
import type { FetchOptions } from "ofetch";

type ProxyOptions = FetchOptions<"json"> & { fallbackMessage?: string };

export async function proxyToBackend<T = unknown>(
  event: H3Event,
  path: string,
  options: ProxyOptions = {},
): Promise<T> {
  const { apiUrl } = useRuntimeConfig();
  const token = getAuthToken(event);
  const { fallbackMessage = "Erro ao consultar a API", ...fetchOptions } = options;

  try {
    return await $fetch<T>(`${apiUrl}${path}`, {
      ...fetchOptions,
      headers: {
        ...(fetchOptions.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (error: any) {
    const status = error?.statusCode ?? error?.status ?? 502;
    const message = error?.response?._data?.message ?? error?.data?.message ?? fallbackMessage;
    throw createError({ statusCode: status, message });
  }
}
