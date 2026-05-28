import type { CurriculumYear } from "~/enums/CurriculumYear";

export interface CurriculumSummaryDto {
  year: CurriculumYear;
  minHoursPerCategory: number | null;
  minCategoriesRequired: number | null;
  excessToFreeMultiplier: number;
  minFreeHours: number;
}
