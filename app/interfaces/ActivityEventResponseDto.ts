import type { ActivityStatus } from "~/interfaces/ActivityResponseDto";

export interface ActivityEventActorDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string | null;
}

export interface ActivityEventResponseDto {
  id: string;
  activityId: string;
  fromStatus: ActivityStatus | null;
  toStatus: ActivityStatus;
  actorId: string;
  actor: ActivityEventActorDto | null;
  comment: string | null;
  createdAt: string;
}
