import type { UserResponseDto } from "~/interfaces/UserResponseDto";

export interface PaginatedUsers {
  items: UserResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
