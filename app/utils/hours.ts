export const roundHours = (value: number | null | undefined): number => {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  return Math.round(value);
};

export const formatHours = (value: number | null | undefined): string => `${roundHours(value)}h`;
