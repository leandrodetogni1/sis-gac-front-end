
export interface CreateCurriculumDto {
  year: number;
  minHoursPerCategory?: number;
  minCategoriesRequired?: number;
  excessToFreeMultiplier: number;
  minFreeHours: number;
}
