export interface InvitationResponseDto {
  id: string;
  email: string;
  role: string;
  inviter: { id: string; email: string } | null;
  createdAt: string;
}
