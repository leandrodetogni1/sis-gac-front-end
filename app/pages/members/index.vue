<script setup lang="ts">
import { Course, CourseLabels } from "~/enums/Course";
import { Situation, SituationLabels } from "~/enums/Situation";
import type { SGTableColumn } from "~/types/SGTableColumn";
import type { UserResponseDto } from "~/interfaces/UserResponseDto";
import type { UserFilters } from "~/composables/useUsers";

useHead({ title: "Alunos — SWGAC" });

const { user } = useAuthState();

if (user.value && user.value.role !== "admin" && user.value.role !== "owner") {
  await navigateTo("/");
}

const { users, total, page, pageSize, totalPages, loading, fetched, error, getUsers } = useUsers();

const route = useRoute();
const router = useRouter();

const PAGE_SIZE = 20;

const readCourseFromQuery = (): Course | "ALL" => {
  const raw = Array.isArray(route.query.course) ? route.query.course[0] : route.query.course;
  return Object.values(Course).includes(raw as Course) ? (raw as Course) : "ALL";
};

const readSituationFromQuery = (): Situation | "ALL" => {
  const raw = Array.isArray(route.query.situation) ? route.query.situation[0] : route.query.situation;
  return Object.values(Situation).includes(raw as Situation) ? (raw as Situation) : "ALL";
};

const search = ref("");
const courseFilter = ref<Course | "ALL">(readCourseFromQuery());
const situationFilter = ref<Situation | "ALL">(readSituationFromQuery());
const currentPage = ref(1);
const sortBy = ref<NonNullable<UserFilters["sortBy"]>>("firstName");
const sortOrder = ref<NonNullable<UserFilters["sortOrder"]>>("asc");

const sortOptions = [
  { label: "Nome (A–Z)", value: "firstName:asc" },
  { label: "Nome (Z–A)", value: "firstName:desc" },
  { label: "Mais recentes", value: "createdAt:desc" },
  { label: "Mais antigos", value: "createdAt:asc" },
  { label: "Email (A–Z)", value: "email:asc" },
  { label: "Matrícula (crescente)", value: "matricula:asc" },
  { label: "Formandos primeiro", value: "situation:asc" },
  { label: "Formados primeiro", value: "situation:desc" },
];

const sortValue = computed({
  get: () => `${sortBy.value}:${sortOrder.value}`,
  set: (value: string) => {
    const [field, order] = value.split(":");
    sortBy.value = field as NonNullable<UserFilters["sortBy"]>;
    sortOrder.value = order as NonNullable<UserFilters["sortOrder"]>;
    fetchMembers();
  },
});

const courseOptions = [
  { label: "Todos os cursos", value: "ALL" },
  ...Object.values(Course).map((value) => ({
    label: CourseLabels[value],
    value,
  })),
];

const situationOptions = [
  { label: "Todas as situações", value: "ALL" },
  ...Object.values(Situation).map((value) => ({
    label: SituationLabels[value],
    value,
  })),
];

const hasActiveFilters = computed(() => {
  return Boolean(search.value.trim()) || courseFilter.value !== "ALL" || situationFilter.value !== "ALL";
});

let lastKey = "";

const fetchMembers = (force = false) => {
  const filters = {
    role: "member",
    search: search.value.trim() || undefined,
    course: courseFilter.value === "ALL" ? undefined : courseFilter.value,
    situation: situationFilter.value === "ALL" ? undefined : situationFilter.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    page: currentPage.value,
    pageSize: PAGE_SIZE,
  };
  const key = JSON.stringify(filters);
  if (!force && key === lastKey && !error.value) return Promise.resolve();
  lastKey = key;
  return getUsers(filters);
};

const applyFilters = () => {
  currentPage.value = 1;
  return fetchMembers();
};

const clearFilters = () => {
  if (searchTimer) clearTimeout(searchTimer);
  search.value = "";
  courseFilter.value = "ALL";
  situationFilter.value = "ALL";
  applyFilters();
};

const syncQuery = async () => {
  const nextCourse = courseFilter.value === "ALL" ? undefined : courseFilter.value;
  const nextSituation = situationFilter.value === "ALL" ? undefined : situationFilter.value;
  if (route.query.course === nextCourse && route.query.situation === nextSituation) return;
  await router.replace({
    query: {
      ...route.query,
      course: nextCourse,
      situation: nextSituation,
    },
  });
};

let searchTimer: ReturnType<typeof setTimeout> | undefined;

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    applyFilters();
  }, 300);
});

watch([courseFilter, situationFilter], async () => {
  await syncQuery();
  await applyFilters();
});

watch(
  () => [route.query.course, route.query.situation],
  () => {
    const nextCourse = readCourseFromQuery();
    const nextSituation = readSituationFromQuery();
    if (nextCourse !== courseFilter.value) courseFilter.value = nextCourse;
    if (nextSituation !== situationFilter.value) situationFilter.value = nextSituation;
  },
);

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer);
});

const columns: SGTableColumn[] = [
  { key: "name", label: "Nome", sortKey: "firstName" },
  { key: "email", label: "Email", sortKey: "email" },
  { key: "matricula", label: "Matrícula", sortKey: "matricula" },
  { key: "course", label: "Curso" },
  { key: "situation", label: "Situação", sortKey: "situation" },
  { key: "createdAt", label: "Cadastrado em", sortKey: "createdAt" },
];

const rangeStart = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1));
const rangeEnd = computed(() => Math.min(page.value * pageSize.value, total.value));

const goToPage = (target: number) => {
  if (target < 1 || target > totalPages.value || target === page.value) return;
  currentPage.value = target;
  fetchMembers();
};

const handleSort = (key: string) => {
  const sortKey = key as NonNullable<UserFilters["sortBy"]>;
  if (sortBy.value === sortKey) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = sortKey;
    sortOrder.value = "asc";
  }
  fetchMembers();
};

const handleRowClick = (member: UserResponseDto) => {
  navigateTo(`/members/${member.id}`);
};

const formatCourse = (value: string | null) => {
  if (!value) return "—";
  return CourseLabels[value as Course] ?? value;
};

const formatSituation = (value: string | null) => {
  if (!value) return "—";
  return SituationLabels[value as Situation] ?? value;
};

const situationBadgeClass = (value: string | null) => {
  const map: Record<string, string> = {
    [Situation.REGULAR]: "border-neutral-200 bg-neutral-100 text-neutral-700",
    [Situation.FORMANDO]: "border-amber-200 bg-amber-50 text-amber-700",
    [Situation.FORMADO]: "border-success-200 bg-success-50 text-success-700",
  };
  return map[value ?? ""] ?? "border-neutral-200 bg-neutral-100 text-neutral-700";
};

onMounted(fetchMembers);
</script>

<template>
  <div>
    <div v-if="!fetched" class="flex min-h-[40vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando alunos...</p>
      </div>
    </div>

    <div v-else>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Alunos</h2>
      </div>

      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div class="w-full sm:max-w-sm">
          <SGInput
            v-model="search"
            placeholder="Buscar por nome, email ou matrícula"
            test-id="search-alunos"
          />
        </div>
        <div class="w-full sm:max-w-xs">
          <SGSelect
            v-model="courseFilter"
            placeholder="Filtrar por curso"
            :options="courseOptions"
            test-id="filter-course"
          />
        </div>
        <div class="w-full sm:max-w-xs">
          <SGSelect
            v-model="situationFilter"
            placeholder="Filtrar por situação"
            :options="situationOptions"
            test-id="filter-situation"
          />
        </div>
        <div class="w-full sm:max-w-xs md:hidden">
          <SGSelect
            v-model="sortValue"
            placeholder="Ordenar por"
            :options="sortOptions"
            test-id="sort-mobile"
          />
        </div>
        <SGButton
          variant="primary"
          icon="lucide:filter-x"
          :disabled="!hasActiveFilters"
          test-id="clear-filters"
          class="min-h-11 sm:min-h-8"
          @click="clearFilters"
        >
          Limpar filtros
        </SGButton>
      </div>

      <SGCard test-id="card-alunos">
        <SGTable
          :columns="columns"
          :items="users"
          :loading="loading"
          :error="error"
          :sort-by="sortBy"
          :sort-order="sortOrder"
          loading-text="Carregando alunos..."
          error-text="Falha ao carregar alunos"
          empty-text="Nenhum aluno encontrado"
          empty-description="Não há alunos cadastrados ainda."
          empty-icon="lucide:graduation-cap"
          test-id="alunos-table"
          clickable
          @retry="fetchMembers(true)"
          @row-click="handleRowClick"
          @sort="handleSort"
        >
          <template #cell-name="{ item: member }">
            <div class="flex items-center gap-2.5">
              <SGAvatar
                :first-name="member.firstName"
                :last-name="member.lastName"
                :picture="member.picture"
                size="sm"
              />
              <span class="font-medium text-neutral-900">{{ member.firstName }} {{ member.lastName }}</span>
            </div>
          </template>

          <template #cell-email="{ item: member }">
            <span class="text-neutral-500">{{ member.email }}</span>
          </template>

          <template #cell-matricula="{ item: member }">
            <span class="text-neutral-500">{{ member.matricula ?? "—" }}</span>
          </template>

          <template #cell-course="{ item: member }">
            <span class="text-neutral-500">{{ formatCourse(member.course) }}</span>
          </template>

          <template #cell-situation="{ item: member }">
            <span
              :class="['inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', situationBadgeClass(member.situation)]"
            >
              {{ formatSituation(member.situation) }}
            </span>
          </template>

          <template #cell-createdAt="{ item: member }">
            <span class="text-neutral-500">{{ formatDateTimeBR(member.createdAt) }}</span>
          </template>

          <template #mobile="{ item: member }">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <SGAvatar
                  :first-name="member.firstName"
                  :last-name="member.lastName"
                  :picture="member.picture"
                  size="sm"
                />
                <div class="min-w-0">
                  <p class="font-medium text-neutral-900">{{ member.firstName }} {{ member.lastName }}</p>
                  <p class="truncate text-sm text-neutral-500">{{ member.email }}</p>
                </div>
              </div>
              <Icon name="lucide:chevron-right" size="1.125rem" class="shrink-0 text-neutral-400" />
            </div>
            <div class="mt-2 flex flex-col gap-1.5 text-sm text-neutral-500">
              <span>{{ member.matricula ?? "—" }} · {{ formatCourse(member.course) }}</span>
              <div class="flex items-center justify-between gap-2">
                <span
                  :class="['inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', situationBadgeClass(member.situation)]"
                >
                  {{ formatSituation(member.situation) }}
                </span>
                <span class="text-xs text-neutral-500">{{ formatDateTimeBR(member.createdAt) }}</span>
              </div>
            </div>
          </template>
        </SGTable>

        <div
          v-if="!loading && !error && users.length > 0"
          class="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-center text-xs text-neutral-500 sm:text-left">
            Mostrando {{ rangeStart }}–{{ rangeEnd }} de {{ total }} alunos
          </p>
          <div class="flex items-center justify-between gap-2 sm:justify-end">
            <SGButton
              variant="secondary"
              icon="lucide:chevron-left"
              size="sm"
              test-id="alunos-prev"
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
              test-id="alunos-next"
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
