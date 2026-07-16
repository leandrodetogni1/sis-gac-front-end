import type { ActivityStatus } from "~/interfaces/ActivityResponseDto";

export type SummaryCategory = "ENSINO" | "PESQUISA" | "EXTENSAO";

export interface CategoryProgress {
  category: SummaryCategory;
  hoursAchieved: number;
  minRequired: number | null;
  meetsMinimum: boolean;
}

export interface ComplementaryProgress {
  totalRawHours: number;
  totalCountedHours: number;
  minRequired: number | null;
  maxAccepted: number | null;
  meetsMinimum: boolean;
}

export interface FreeProgress {
  loggedHours: number;
  carriedOverFromComplementary: number;
  totalHours: number;
  minRequired: number | null;
  meetsMinimum: boolean;
}

export interface CappedType {
  cod: string;
  label: string;
  hoursAchieved: number;
  maxAllowed: number;
}

export interface MeSummaryResponseDto {
  totalActivities: number;
  totalHoursApproved: number;
  totalHoursInReview: number;
  byStatus: Record<ActivityStatus, { count: number; hours: number }>;
  approvedHoursByCategory: Record<SummaryCategory, number>;
  approvedHoursByClass: { COMPLEMENTAR: number; LIVRE: number };
  curriculum: {
    curriculumYear: number | null;
    course: string | null;
  };
  categoryProgress: CategoryProgress[];
  complementaryProgress: ComplementaryProgress;
  freeProgress: FreeProgress;
  cappedTypes: CappedType[];
}
