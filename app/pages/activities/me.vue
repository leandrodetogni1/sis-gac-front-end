<script setup lang="ts">
import { Category, CategoryLabels } from "~/enums/Category";
import type { ActivityResponseDto, ActivityStatus } from "~/interfaces/ActivityResponseDto";
import type { ActivitySortBy } from "~/composables/useActivities";

useHead({ title: "Minhas Atividades — SISGAC" });

const { user } = useAuthState();
const { activities, total, page, pageSize, totalPages, fetched, error, getMyActivities } = useActivities();

if (user.value && user.value.role !== "member") {
  await navigateTo("/activities");
}

const selectedActivity = ref<ActivityResponseDto | null>(null);
const modalOpen = ref(false);
const editModalOpen = ref(false);

const PAGE_SIZE = 20;

const statusFilter = ref<ActivityStatus | "ALL">("ALL");
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
  getMyActivities({
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

watch([statusFilter, categoryFilter], applyFilters);

onMounted(fetchActivities);
</script>

<template>
  <div>
    <div v-if="!fetched" data-testid="page-loading">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SGSkeleton class="h-6 w-40" />
        <SGSkeleton class="h-9 w-36" />
      </div>

      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div class="w-full sm:w-56">
          <SGSkeleton class="h-11 w-full sm:h-8" />
        </div>
        <div class="w-full sm:w-56">
          <SGSkeleton class="h-11 w-full sm:h-8" />
        </div>
        <div class="w-full sm:w-56 md:hidden">
          <SGSkeleton class="h-11 w-full sm:h-8" />
        </div>
      </div>

      <SGCard>
        <SGTableSkeleton mobile-cards :columns="6" :rows="5" :align-last-right="false" />
      </SGCard>

      <div class="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <SGSkeleton class="mx-auto h-3 w-56 sm:mx-0" />
        <div class="flex items-center justify-between gap-2 sm:justify-end">
          <SGSkeleton class="h-8 w-24" />
          <SGSkeleton class="h-3 w-24" />
          <SGSkeleton class="h-8 w-24" />
        </div>
      </div>
    </div>

    <div v-else>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Minhas Atividades</h2>
        <SGButton test-id="create-activity-button" variant="primary" icon="lucide:plus" @click="navigateTo('/activities/create')">
          Nova Atividade
        </SGButton>
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
        :show-user="false"
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
      :show-user="false"
      @approved="onStatusChanged"
      @verified="onStatusChanged"
      @rejected="onStatusChanged"
      @deleted="onStatusChanged"
      @edit="onEdit"
    />

    <activities-edit-modal v-model:open="editModalOpen" :activity="selectedActivity" @updated="onUpdated" />
  </div>
</template>
