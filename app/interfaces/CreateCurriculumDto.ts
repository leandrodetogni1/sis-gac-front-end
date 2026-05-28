import type { CurriculumYear } from "~/enums/CurriculumYear";

export interface CreateCurriculumDto {
  year: CurriculumYear;
  minHoursPerCategory?: number;
  minCategoriesRequired?: number;
  excessToFreeMultiplier: number;
  minFreeHours: number;
}
