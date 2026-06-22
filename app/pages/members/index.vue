<script setup lang="ts">
import { Course, CourseLabels } from "~/enums/Course";
import { Situation, SituationLabels } from "~/enums/Situation";
import type { SGTableColumn } from "~/types/SGTableColumn";
import type { UserResponseDto } from "~/interfaces/UserResponseDto";

useHead({ title: "Alunos — SWGAC" });

const { user } = useAuthState();

if (user.value && user.value.role !== "admin" && user.value.role !== "owner") {
  await navigateTo("/");
}

const { users, fetched, error, getUsers } = useUsers();

const route = useRoute();
const router = useRouter();

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

const clearFilters = () => {
  search.value = "";
  courseFilter.value = "ALL";
  situationFilter.value = "ALL";
};

const fetchMembers = async () => {
  await getUsers({
    role: "member",
    course: courseFilter.value === "ALL" ? undefined : courseFilter.value,
    situation: situationFilter.value === "ALL" ? undefined : situationFilter.value,
  });
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

watch([courseFilter, situationFilter], async () => {
  await syncQuery();
  await fetchMembers();
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

const columns: SGTableColumn[] = [
  { key: "name", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "matricula", label: "Matrícula" },
  { key: "course", label: "Curso" },
  { key: "situation", label: "Situação" },
  { key: "createdAt", label: "Cadastrado em" },
];

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return users.value;
  return users.value.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(term) || u.email.toLowerCase().includes(term);
  });
});

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
            placeholder="Buscar por nome ou email"
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
          :items="filteredUsers"
          :error="error"
          error-text="Falha ao carregar alunos"
          empty-text="Nenhum aluno encontrado"
          empty-description="Não há alunos cadastrados ainda."
          empty-icon="lucide:graduation-cap"
          test-id="alunos-table"
          clickable
          @retry="fetchMembers"
          @row-click="handleRowClick"
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
      </SGCard>
    </div>
  </div>
</template>
