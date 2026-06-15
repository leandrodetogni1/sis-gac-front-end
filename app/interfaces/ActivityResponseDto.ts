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
  hoursEquivalent: number | null;
  certificateUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  users: ActivityUserSummaryDto | null;
  activity_types: ActivityTypeSummaryDto | null;
  file: ActivityFileDto | null;
}

export interface ActivityFileDto {
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface CreateActivityResponseDto {
  message: string;
  activity: ActivityResponseDto;
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
  picture: string | null;
}
