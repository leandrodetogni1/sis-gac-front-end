export const formatDateTimeBR = (value: string | Date | null | undefined): string => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const day = date.toLocaleDateString("pt-BR");
  return `${time} - ${day}`;
};
