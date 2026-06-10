export enum Course {
  CIENCIA_DA_COMPUTACAO = "CIENCIA_DA_COMPUTACAO",
  ENGENHARIA_DA_COMPUTACAO = "ENGENHARIA_DA_COMPUTACAO",
}

export const CourseLabels: Record<Course, string> = {
  [Course.CIENCIA_DA_COMPUTACAO]: "Ciência da Computação",
  [Course.ENGENHARIA_DA_COMPUTACAO]: "Engenharia de Computação",
};
