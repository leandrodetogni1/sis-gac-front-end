export interface AuditActorDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuditLogResponseDto {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  method: string | null;
  path: string | null;
  statusCode: number | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string | null;
  actor: AuditActorDto | null;
}

export interface AuditLogsPageDto {
  items: AuditLogResponseDto[];
  total: number;
  page: number;
  limit: number;
}
