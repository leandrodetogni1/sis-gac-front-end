import type {
  AuditLogResponseDto,
  AuditLogsPageDto,
} from "~/interfaces/AuditLogResponseDto";

export interface AuditLogFilters {
  actorId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const useAudit = () => {
  const api = useApi();
  const logs = ref<AuditLogResponseDto[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(50);
  const loading = ref(false);
  const fetched = ref(false);
  const error = ref<string | null>(null);

  const getLogs = async (filters: AuditLogFilters = {}): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const query: Record<string, string> = {};
      if (filters.actorId) query.actorId = filters.actorId;
      if (filters.action) query.action = filters.action;
      if (filters.entityType) query.entityType = filters.entityType;
      if (filters.entityId) query.entityId = filters.entityId;
      if (filters.from) query.from = filters.from;
      if (filters.to) query.to = filters.to;
      query.page = String(filters.page ?? 1);
      query.limit = String(filters.limit ?? limit.value);

      const data = await api<AuditLogsPageDto>("/api/audit-logs", { query });
      logs.value = data.items;
      total.value = data.total;
      page.value = data.page;
      limit.value = data.limit;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar logs de auditoria";
      logs.value = [];
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  return { logs, total, page, limit, loading, fetched, error, getLogs };
};
