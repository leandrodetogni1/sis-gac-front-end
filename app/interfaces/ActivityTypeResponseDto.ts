export interface ActivityTypeResponseDto {
  id: string;
  cod: string;
  label: string;
  category: string | null;
  unity: string | null;
}

export interface ActivityTypeSummaryDto {
  id: string;
  cod: string;
  label: string;
}
