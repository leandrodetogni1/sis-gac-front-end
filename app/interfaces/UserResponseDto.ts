export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string | null;
  matricula: number | null;
  course: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
