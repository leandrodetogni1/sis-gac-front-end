import type { InvitableRole } from "~/types/InvitableRole";

export interface CreateInvitationDto {
  email: string;
  role: InvitableRole;
}
