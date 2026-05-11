import type { ActivityClass } from "~/interfaces/ActivityResponseDto";

export interface UpdateActivityDto {
  activityTypeId?: string;
  class?: ActivityClass;
  event?: string;
  organization?: string;
  hours?: number;
  certificateUrl?: string;
  startDate?: string;
  endDate?: string;
}
