export type ActivityStatus = "PENDING" | "VERIFIED" | "APPROVED" | "REJECTED";
export type ActivityClass = "COMPLEMENTAR" | "LIVRE";

export interface ActivityResponseDto {
  id: string;
  authorId: string | null;
  status: ActivityStatus | null;
  class: ActivityClass | null;
  activityTypeId: string | null;
  event: string | null;
  organization: string | null;
  hours: number | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  users: ActivityUserSummaryDto | null;
  activity_types: ActivityTypeSummaryDto | null;
}

export interface ActivityTypeSummaryDto {
  id: string;
  cod: string;
  label: string;
  category: string;
  unity: string;
}

export interface ActivityUserSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
