export enum Situation {
  REGULAR = "REGULAR",
  FORMANDO = "FORMANDO",
  FORMADO = "FORMADO",
}

export const SituationLabels: Record<Situation, string> = {
  [Situation.REGULAR]: "Regular",
  [Situation.FORMANDO]: "Provável Formando",
  [Situation.FORMADO]: "Formado",
};
