export interface CreateActivityDto {
  authorId: string;
  activityTypeId: string;
  class: string;
  event: string;
  organization?: string;
  hours: number;
  startDate: string;
  endDate: string;
}
