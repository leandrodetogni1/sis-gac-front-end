export interface AuditActorDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string | null;
}

export interface AuditLogMetadata {
  label?: string;
  email?: string;
  role?: string;
  userId?: string;
}

export interface AuditLogResponseDto {
  id: string;
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
  metadata: AuditLogMetadata | null;
}

export interface AuditLogsPageDto {
  items: AuditLogResponseDto[];
  total: number;
  page: number;
  limit: number;
}
