export default defineEventHandler(async (event) => {
  const year = getRouterParam(event, "year");
  const course = getRouterParam(event, "course");
  const res = await proxyToBackend<{ data: unknown }>(event, `/curricula/${year}/course-rules/${course}`, {
    method: "DELETE",
    fallbackMessage: "Erro ao remover regra de curso",
  });
  return res.data;
});
