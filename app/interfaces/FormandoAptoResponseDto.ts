export interface FormandoAptoItemDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  matricula: string | null;
  course: string | null;
  curriculumYear: string | null;
  hoursEnsino: number;
  hoursPesquisa: number;
  hoursExtensao: number;
  hoursComplementar: number;
  hoursLivre: number;
  totalHoursApproved: number;
}

export interface FormandosAptosResponseDto {
  items: FormandoAptoItemDto[];
  total: number;
}
