import type { Course } from "~/enums/Course";
import type { CurriculumYear } from "~/enums/CurriculumYear";
import type { SummaryCategory } from "~/interfaces/MeSummaryResponseDto";

export interface AdminDashboardFormandoUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string | null;
  matricula: string | null;
  course: Course | null;
  curriculumYear: CurriculumYear | null;
}

export interface AdminDashboardCategoryGap {
  category: SummaryCategory;
  achieved: number;
  required: number;
  gap: number;
}

export interface AdminDashboardFormando {
  user: AdminDashboardFormandoUser;
  totalHoursApproved: number;
  complementaryGap: number;
  freeGap: number;
  totalGap: number;
  categoryGaps: AdminDashboardCategoryGap[];
  blockers: string[];
  isReadyToGraduate: boolean;
}

export interface AdminDashboardRegularStudent {
  user: AdminDashboardFormandoUser;
  totalHoursApproved: number;
  complementaryHours: number;
  freeHours: number;
  categoryHours: Record<SummaryCategory, number>;
}

export interface AdminDashboardOldestAwaiting {
  id: string;
  event: string;
  createdAt: string;
  daysWaiting: number;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface AdminDashboardReviewQueue {
  totalAwaiting: number;
  pendingCount: number;
  verifiedCount: number;
  oldestAwaiting: AdminDashboardOldestAwaiting | null;
}

export interface AdminDashboardSystemStats {
  totalUsers: number;
  totalFormandos: number;
  activitiesApprovedLast30Days: number;
  totalActivitiesPending: number;
}

export interface AdminDashboardResponseDto {
  formandosAtRisk: AdminDashboardFormando[];
  regularStudentsProgress: AdminDashboardRegularStudent[];
  reviewQueue: AdminDashboardReviewQueue;
  systemStats: AdminDashboardSystemStats;
}
