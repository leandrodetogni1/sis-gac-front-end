import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";

export interface PaginatedActivities {
  items: ActivityResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
