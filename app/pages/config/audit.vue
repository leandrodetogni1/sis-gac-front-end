<script setup lang="ts">
import type { SGTableColumn } from "~/types/SGTableColumn";

useHead({ title: "Auditoria — Configurações — SISGAC" });

const { logs, total, page, limit, loading, fetched, error, getLogs } = useAudit();

const actorId = ref("");
const from = ref("");
const to = ref("");
const pageSize = ref("50");
const currentPage = ref(1);

const pageSizeOptions = [
  { label: "25 por página", value: "25" },
  { label: "50 por página", value: "50" },
  { label: "100 por página", value: "100" },
];

const columns: SGTableColumn[] = [
  { key: "createdAt", label: "Data e hora" },
  { key: "actor", label: "Ator" },
  { key: "action", label: "Ação" },
  { key: "status", label: "Status", align: "center" },
  { key: "origin", label: "Origem" },
];

const buildFilters = () => ({
  actorId: actorId.value || undefined,
  from: from.value ? `${from.value}T00:00:00` : undefined,
  to: to.value ? `${to.value}T23:59:59.999` : undefined,
  limit: Number(pageSize.value),
  page: currentPage.value,
});

const fetchLogs = () => getLogs(buildFilters());

const applyFilters = () => {
  currentPage.value = 1;
  return fetchLogs();
};

const clearFilters = () => {
  actorId.value = "";
  from.value = "";
  to.value = "";
  currentPage.value = 1;
  return fetchLogs();
};

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const rangeStart = computed(() => (total.value === 0 ? 0 : (page.value - 1) * limit.value + 1));
const rangeEnd = computed(() => Math.min(page.value * limit.value, total.value));

const goToPage = (target: number) => {
  if (target < 1 || target > totalPages.value || target === page.value) return;
  currentPage.value = target;
  fetchLogs();
};

const actorName = (row: (typeof logs.value)[number]) => {
  if (row.actor) return `${row.actor.firstName} ${row.actor.lastName}`.trim();
  return "Sistema";
};

const statusBadge = (code: number | null) => {
  if (code == null) return { label: "—", cls: "border-neutral-300 bg-neutral-50 text-neutral-500" };
  if (code >= 200 && code < 300) return { label: String(code), cls: "border-emerald-300 bg-emerald-50 text-emerald-700" };
  if (code >= 300 && code < 400) return { label: String(code), cls: "border-blue-300 bg-blue-50 text-blue-700" };
  if (code >= 400 && code < 500) return { label: String(code), cls: "border-amber-300 bg-amber-50 text-amber-700" };
  return { label: String(code), cls: "border-red-300 bg-red-50 text-red-700" };
};

watch([pageSize, actorId], () => {
  applyFilters();
});

onMounted(() => {
  fetchLogs();
});
</script>

<template>
  <div>
    <div v-if="!fetched" class="flex min-h-[40vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando auditoria...</p>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="flex flex-col gap-1">
        <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Auditoria</h2>
        <p class="text-sm text-neutral-500">Trilha de todas as ações administrativas e de autenticação.</p>
      </div>

      <SGCard test-id="audit-filters">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-medium text-neutral-600">Ator</label>
            <audit-actor-filter v-model="actorId" test-id="audit-filter-actor" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-neutral-600">De</label>
            <SGDatePicker v-model="from" placeholder="Data inicial" test-id="audit-filter-from" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-neutral-600">Até</label>
            <SGDatePicker v-model="to" placeholder="Data final" test-id="audit-filter-to" />
          </div>
        </div>

        <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="w-full sm:w-48">
            <SGSelect v-model="pageSize" :options="pageSizeOptions" test-id="audit-page-size" />
          </div>
          <div class="grid grid-cols-2 gap-2 sm:flex">
            <SGButton variant="secondary" icon="lucide:x" size="sm" test-id="audit-clear" @click="clearFilters"> Limpar </SGButton>
            <SGButton variant="primary" icon="lucide:filter" size="sm" test-id="audit-apply" @click="applyFilters"> Filtrar </SGButton>
          </div>
        </div>
      </SGCard>

      <SGCard test-id="card-audit">
        <SGTable
          :columns="columns"
          :items="logs"
          item-key="id"
          :loading="loading"
          :error="error"
          loading-text="Carregando logs..."
          error-text="Falha ao carregar a auditoria"
          empty-text="Nenhum registro encontrado"
          empty-description="Ajuste os filtros ou aguarde novas ações."
          empty-icon="lucide:scroll-text"
          test-id="audit-table"
          @retry="fetchLogs"
        >
          <template #cell-createdAt="{ item: row }">
            <span class="whitespace-nowrap text-neutral-600">{{ formatDateTimeBR(row.createdAt) }}</span>
          </template>

          <template #cell-actor="{ item: row }">
            <div class="flex items-center gap-2.5">
              <SGAvatar v-if="row.actor" :first-name="row.actor.firstName" :last-name="row.actor.lastName" :picture="row.actor.picture" size="sm" />
              <div v-else class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <Icon name="lucide:server" size="1rem" />
              </div>
              <div class="flex flex-col">
                <span class="font-medium text-neutral-900">{{ actorName(row) }}</span>
                <span v-if="row.actor" class="text-xs text-neutral-400">{{ row.actor.email }}</span>
              </div>
            </div>
          </template>

          <template #cell-action="{ item: row }">
            <span class="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700" :title="row.action">{{
              formatAuditAction(row.action)
            }}</span>
          </template>

          <template #cell-status="{ item: row }">
            <span :class="['inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', statusBadge(row.statusCode).cls]">
              {{ statusBadge(row.statusCode).label }}
            </span>
          </template>

          <template #cell-origin="{ item: row }">
            <div class="flex items-center gap-2">
              <span class="rounded border border-neutral-200 px-1.5 py-0.5 font-mono text-xs text-neutral-500">{{ row.method ?? "—" }}</span>
              <span class="max-w-[16rem] truncate text-xs text-neutral-500" :title="row.path ?? ''">{{ row.path ?? "—" }}</span>
            </div>
          </template>

          <template #mobile="{ item: row }">
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 items-start gap-2.5">
                <SGAvatar v-if="row.actor" :first-name="row.actor.firstName" :last-name="row.actor.lastName" :picture="row.actor.picture" size="sm" />
                <div v-else class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                  <Icon name="lucide:server" size="1rem" />
                </div>
                <div class="min-w-0">
                  <p class="truncate font-medium text-neutral-900">{{ actorName(row) }}</p>
                  <p v-if="row.actor" class="truncate text-xs text-neutral-400">{{ row.actor.email }}</p>
                  <p class="mt-1">
                    <span class="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700" :title="row.action">{{
                      formatAuditAction(row.action)
                    }}</span>
                  </p>
                </div>
              </div>
              <span
                :class="['shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', statusBadge(row.statusCode).cls]"
              >
                {{ statusBadge(row.statusCode).label }}
              </span>
            </div>
            <div class="mt-2 flex min-w-0 items-center gap-2 text-xs text-neutral-500">
              <span class="shrink-0 rounded border border-neutral-200 px-1.5 py-0.5 font-mono">{{ row.method ?? "—" }}</span>
              <span class="truncate" :title="row.path ?? ''">{{ row.path ?? "—" }}</span>
            </div>
            <p class="mt-1.5 text-xs text-neutral-400">{{ formatDateTimeBR(row.createdAt) }}</p>
          </template>
        </SGTable>

        <div
          v-if="!loading && !error && logs.length > 0"
          class="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-center text-xs text-neutral-500 sm:text-left">Mostrando {{ rangeStart }}–{{ rangeEnd }} de {{ total }} registros</p>
          <div class="flex items-center justify-between gap-2 sm:justify-end">
            <SGButton variant="secondary" icon="lucide:chevron-left" size="sm" test-id="audit-prev" :disabled="page <= 1" @click="goToPage(page - 1)">
              Anterior
            </SGButton>
            <span class="shrink-0 text-xs text-neutral-500">Página {{ page }} de {{ totalPages }}</span>
            <SGButton
              variant="secondary"
              icon="lucide:chevron-right"
              size="sm"
              test-id="audit-next"
              :disabled="page >= totalPages"
              @click="goToPage(page + 1)"
            >
              Próxima
            </SGButton>
          </div>
        </div>
      </SGCard>
    </div>
  </div>
</template>
