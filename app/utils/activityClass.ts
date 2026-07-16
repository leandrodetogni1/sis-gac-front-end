import type { ActivityClass } from "~/interfaces/ActivityResponseDto";

const CLASS_LABELS: Record<ActivityClass, string> = {
  COMPLEMENTAR: "Complementar",
  LIVRE: "Livre",
};

export const formatActivityClass = (value: ActivityClass | null | undefined): string => {
  if (!value) return "—";
  return CLASS_LABELS[value] ?? value;
};
