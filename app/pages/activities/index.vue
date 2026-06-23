<script setup lang="ts">
import { Category, CategoryLabels } from "~/enums/Category";
import type { ActivityResponseDto, ActivityStatus } from "~/interfaces/ActivityResponseDto";
import type { ActivitySortBy } from "~/composables/useActivities";

useHead({ title: "Atividades — SISGAC" });

const { user } = useAuthState();
const { activities, total, page, pageSize, totalPages, fetched, error, getActivities } = useActivities();

if (user.value?.role === "member") {
  await navigateTo("/activities/me");
}

const selectedActivity = ref<ActivityResponseDto | null>(null);
const modalOpen = ref(false);
const editModalOpen = ref(false);

const route = useRoute();
const router = useRouter();

const PAGE_SIZE = 20;

const readStatusFromQuery = (): ActivityStatus | "ALL" => {
  const raw = Array.isArray(route.query.status) ? route.query.status[0] : route.query.status;
  const allowed: ActivityStatus[] = ["PENDING", "VERIFIED", "APPROVED", "REJECTED"];
  return allowed.includes(raw as ActivityStatus) ? (raw as ActivityStatus) : "ALL";
};

const statusFilter = ref<ActivityStatus | "ALL">(readStatusFromQuery());
const categoryFilter = ref<Category | "ALL">("ALL");
const sortBy = ref<ActivitySortBy>("createdAt");
const sortOrder = ref<"asc" | "desc">("desc");
const currentPage = ref(1);

const statusOptions = [
  { label: "Todos os status", value: "ALL" },
  { label: "Pendente", value: "PENDING" },
  { label: "Verificado", value: "VERIFIED" },
  { label: "Aprovado", value: "APPROVED" },
  { label: "Rejeitado", value: "REJECTED" },
];

const categoryOptions = [
  { label: "Todas as categorias", value: "ALL" },
  ...Object.values(Category).map((value) => ({ label: CategoryLabels[value], value })),
];

const fetchActivities = () =>
  getActivities({
    status: statusFilter.value === "ALL" ? undefined : statusFilter.value,
    category: categoryFilter.value === "ALL" ? undefined : categoryFilter.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    page: currentPage.value,
    pageSize: PAGE_SIZE,
  });

const applyFilters = () => {
  currentPage.value = 1;
  return fetchActivities();
};

const handleSort = (key: string) => {
  const sortKey = key as ActivitySortBy;
  if (sortBy.value === sortKey) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = sortKey;
    sortOrder.value = "asc";
  }
  applyFilters();
};

const sortOptions = [
  { label: "Mais recentes", value: "createdAt:desc" },
  { label: "Mais antigas", value: "createdAt:asc" },
  { label: "Maior carga horária", value: "hoursEquivalent:desc" },
  { label: "Menor carga horária", value: "hoursEquivalent:asc" },
  { label: "Status (A–Z)", value: "status:asc" },
  { label: "Status (Z–A)", value: "status:desc" },
];

const sortValue = computed({
  get: () => `${sortBy.value}:${sortOrder.value}`,
  set: (value: string) => {
    const [field, order] = value.split(":");
    sortBy.value = field as ActivitySortBy;
    sortOrder.value = order as "asc" | "desc";
    applyFilters();
  },
});

const refetch = async () => {
  await fetchActivities();
  if (activities.value.length === 0 && total.value > 0 && currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
    await fetchActivities();
  }
};

const onSelect = (activity: ActivityResponseDto) => {
  selectedActivity.value = activity;
  modalOpen.value = true;
};

const onStatusChanged = async () => {
  modalOpen.value = false;
  await refetch();
};

const onEdit = (activity: ActivityResponseDto) => {
  selectedActivity.value = activity;
  editModalOpen.value = true;
};

const onUpdated = async () => {
  editModalOpen.value = false;
  await refetch();
};

const rangeStart = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1));
const rangeEnd = computed(() => Math.min(page.value * pageSize.value, total.value));

const goToPage = (target: number) => {
  if (target < 1 || target > totalPages.value || target === page.value) return;
  currentPage.value = target;
  fetchActivities();
};

watch(statusFilter, async (value) => {
  const nextStatus = value === "ALL" ? undefined : value;
  if (route.query.status !== nextStatus) {
    await router.replace({ query: { ...route.query, status: nextStatus } });
  }
  await applyFilters();
});

watch(categoryFilter, applyFilters);

watch(
  () => route.query.status,
  () => {
    const next = readStatusFromQuery();
    if (next !== statusFilter.value) statusFilter.value = next;
  },
);

onMounted(fetchActivities);
</script>

<template>
  <div>
    <div v-if="!fetched" class="flex min-h-[60vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando dados...</p>
      </div>
    </div>

    <div v-else>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Atividades Complementares</h2>
      </div>

      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div class="w-full sm:w-56">
          <SGSelect v-model="categoryFilter" placeholder="Filtrar por categoria" :options="categoryOptions" test-id="filter-category" />
        </div>
        <div class="w-full sm:w-56">
          <SGSelect v-model="statusFilter" placeholder="Filtrar por status" :options="statusOptions" test-id="filter-status" />
        </div>
        <div class="w-full sm:w-56 md:hidden">
          <SGSelect v-model="sortValue" placeholder="Ordenar por" :options="sortOptions" test-id="sort-mobile" />
        </div>
      </div>

      <activities-list
        :activities="activities"
        :error="error"
        :can-create="false"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        sortable
        @retry="fetchActivities"
        @select="onSelect"
        @sort="handleSort"
      />

      <div
        v-if="!error && activities.length > 0"
        class="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-center text-xs text-neutral-500 sm:text-left">Mostrando {{ rangeStart }}–{{ rangeEnd }} de {{ total }} atividades</p>
        <div class="flex items-center justify-between gap-2 sm:justify-end">
          <SGButton
            variant="secondary"
            icon="lucide:chevron-left"
            size="sm"
            test-id="activities-prev"
            :disabled="page <= 1"
            @click="goToPage(page - 1)"
          >
            Anterior
          </SGButton>
          <span class="shrink-0 text-xs text-neutral-500">Página {{ page }} de {{ totalPages }}</span>
          <SGButton
            variant="secondary"
            icon="lucide:chevron-right"
            size="sm"
            test-id="activities-next"
            :disabled="page >= totalPages"
            @click="goToPage(page + 1)"
          >
            Próxima
          </SGButton>
        </div>
      </div>
    </div>

    <activities-detail-modal
      v-model:open="modalOpen"
      :activity="selectedActivity"
      @approved="onStatusChanged"
      @verified="onStatusChanged"
      @rejected="onStatusChanged"
      @deleted="onStatusChanged"
      @edit="onEdit"
    />

    <activities-edit-modal v-model:open="editModalOpen" :activity="selectedActivity" @updated="onUpdated" />
  </div>
</template>
