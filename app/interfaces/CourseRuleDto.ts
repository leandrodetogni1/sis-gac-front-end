import type { Course } from "~/enums/Course";

export interface CourseRuleDto {
  course: Course;
  totalMin: number;
  totalMax: number;
}
