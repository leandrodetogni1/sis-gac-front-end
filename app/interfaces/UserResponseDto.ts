export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string | null;
  matricula: number | null;
  curso: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
