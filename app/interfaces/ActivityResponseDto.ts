export interface ActivityResponseDto {
  id: string;
  authorId: string | null;
  unity: string | null;
  status: "approved" | "verified" | "pending" | "rejected" | null;
  category: string | null;
  class: string | null;
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
}

export interface ActivityUserSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
