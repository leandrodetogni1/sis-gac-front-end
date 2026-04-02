export interface CreateActivityTypeDto {
  cod: string;
  label: string;
  category: string;
  unity: string;
  maxHoursInComplementarActivities: number;
  maxHoursPerCertificateOrSemester: number;
}
