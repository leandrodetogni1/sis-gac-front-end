const CATEGORY_LABELS: Record<string, string> = {
  ENSINO: "Ensino",
  PESQUISA: "Pesquisa",
  EXTENSAO: "Extensão",
};

export const formatCategory = (value: string | null | undefined): string => {
  if (!value) return "—";
  const known = CATEGORY_LABELS[value.toUpperCase()];
  if (known) return known;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};
