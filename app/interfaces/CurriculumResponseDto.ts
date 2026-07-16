import type { CourseRuleDto } from "~/interfaces/CourseRuleDto";
import type { ActivityTypeRuleDto } from "~/interfaces/ActivityTypeRuleDto";

export interface CurriculumResponseDto {
  year: number;
  minHoursPerCategory: number | null;
  minCategoriesRequired: number | null;
  excessToFreeMultiplier: number;
  minFreeHours: number;
  courseRules: CourseRuleDto[];
  activityTypeRules: ActivityTypeRuleDto[];
}
