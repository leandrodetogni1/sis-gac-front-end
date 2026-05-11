export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string | null;
  role: string | null;
  matricula: number | null;
  course: string | null;
  curriculumYear: string | null;
  situation: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
