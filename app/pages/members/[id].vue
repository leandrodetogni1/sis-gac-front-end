<script setup lang="ts">
import { Course, CourseLabels } from "~/enums/Course";
import { CurriculumYear, CurriculumYearLabels } from "~/enums/CurriculumYear";
import { Situation, SituationLabels } from "~/enums/Situation";
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";
import type { UserResponseDto } from "~/interfaces/UserResponseDto";

const route = useRoute();
const router = useRouter();

const memberId = computed(() => route.params.id as string);

const { getUser } = useUsers();
const { activities, error: activitiesError, fetched, getActivitiesByUser } = useActivities();
const { user: currentUser } = useAuthState();

const fetchActivities = () => getActivitiesByUser(memberId.value, { pageSize: 100 });

const canEdit = computed(() => {
  const role = currentUser.value?.role;
  return role === "admin" || role === "owner";
});

const isSelf = computed(() => Boolean(currentUser.value) && currentUser.value?.id === memberId.value);

const user = ref<UserResponseDto | null>(null);
const userError = ref<string | null>(null);
const pageLoading = ref(true);

const selectedActivity = ref<ActivityResponseDto | null>(null);
const modalOpen = ref(false);

const editOpen = ref(false);

const summaryRef = ref<{ refresh: () => Promise<void> } | null>(null);

const onUserUpdated = (updated: UserResponseDto) => {
  user.value = updated;
};

const fullName = computed(() => {
  if (!user.value) return "—";
  return `${user.value.firstName} ${user.value.lastName}`;
});

const createdAt = computed(() => formatDateTimeBR(user.value?.createdAt));

const matriculaLabel = computed(() => {
  const value = user.value?.matricula;
  return value !== null && value !== undefined ? String(value) : "—";
});

const courseLabel = computed(() => {
  const value = user.value?.course;
  if (!value) return "—";
  return CourseLabels[value as Course] ?? value;
});

const curriculumLabel = computed(() => {
  const value = user.value?.curriculumYear;
  if (!value) return "—";
  return CurriculumYearLabels[value as CurriculumYear] ?? value;
});

const situationLabel = computed(() => {
  const value = user.value?.situation;
  if (!value) return "—";
  return SituationLabels[value as Situation] ?? value;
});

const onSelect = (activity: ActivityResponseDto) => {
  selectedActivity.value = activity;
  modalOpen.value = true;
};

const onStatusChanged = async () => {
  modalOpen.value = false;
  await Promise.all([fetchActivities(), summaryRef.value?.refresh()]);
};

onMounted(async () => {
  pageLoading.value = true;
  const [fetchedUser] = await Promise.all([getUser(memberId.value), fetchActivities()]);
  if (!fetchedUser) {
    userError.value = "Usuário não encontrado";
  } else {
    user.value = fetchedUser;
    useHead({ title: `${fetchedUser.firstName} ${fetchedUser.lastName} — SISGAC` });
  }
  pageLoading.value = false;
});
</script>

<template>
  <div>
    <div v-if="pageLoading" data-testid="page-loading">
      <div class="mb-6 flex items-center gap-3">
        <SGSkeleton class="h-5 w-20" />
      </div>

      <div class="mb-6">
        <SGCard>
          <div class="flex items-start gap-4">
            <SGSkeleton class="h-14 w-14 rounded-full" />
            <div class="min-w-0 flex-1">
              <SGSkeleton class="h-5 w-48" />
              <SGSkeleton class="mt-2 h-4 w-56" />
            </div>
            <SGSkeleton v-if="canEdit" class="h-11 w-24 sm:h-9" />
          </div>

          <div class="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 md:grid-cols-3 lg:grid-cols-5">
            <div v-for="i in 5" :key="i">
              <SGSkeleton class="h-3 w-16" />
              <SGSkeleton class="mt-1.5 h-4 w-24" />
            </div>
          </div>
        </SGCard>
      </div>

      <div class="mb-6">
        <SGSkeleton class="mb-3 h-5 w-20" />
        <dashboard-summary-skeleton />
      </div>

      <div>
        <SGSkeleton class="mb-3 h-5 w-56" />
        <SGCard>
          <SGTableSkeleton mobile-cards :columns="6" :rows="5" :align-last-right="false" />
        </SGCard>
      </div>
    </div>

    <div v-else>
      <div class="mb-6 flex items-center gap-3">
        <button
          class="-my-1.5 flex min-h-11 items-center gap-1.5 py-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 sm:my-0 sm:min-h-0 sm:py-0"
          data-testid="back-button"
          @click="router.back()"
        >
          <Icon name="lucide:arrow-left" size="1rem" />
          Voltar
        </button>
      </div>

      <div v-if="userError" class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {{ userError }}
      </div>

      <div v-if="user" class="mb-6">
        <SGCard>
          <div class="flex items-start gap-4">
            <SGAvatar :first-name="user.firstName" :last-name="user.lastName" :picture="user.picture" size="xl" />
            <div class="min-w-0 flex-1">
              <h1 class="text-lg font-semibold text-neutral-900">{{ fullName }}</h1>
              <p class="text-sm text-neutral-500">{{ user.email }}</p>
            </div>
            <SGButton
              v-if="canEdit"
              variant="secondary"
              size="sm"
              icon="lucide:pencil"
              test-id="member-edit-button"
              class="min-h-11 sm:min-h-0"
              @click="editOpen = true"
            >
              Editar
            </SGButton>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 text-sm md:grid-cols-3 lg:grid-cols-5">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Matrícula</p>
              <p class="mt-0.5 font-medium text-neutral-900 tabular-nums">{{ matriculaLabel }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Curso</p>
              <p class="mt-0.5 font-medium text-neutral-900">{{ courseLabel }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Currículo</p>
              <p class="mt-0.5 font-medium text-neutral-900">{{ curriculumLabel }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Situação</p>
              <p class="mt-0.5 font-medium text-neutral-900">{{ situationLabel }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-500">Cadastrado em</p>
              <p class="mt-0.5 font-medium text-neutral-900">{{ createdAt }}</p>
            </div>
          </div>
        </SGCard>
      </div>

      <div class="mb-6">
        <h2 class="mb-3 text-base font-semibold text-neutral-900">Resumo</h2>
        <dashboard-member-summary ref="summaryRef" :user-id="memberId" />
      </div>

      <div>
        <h2 class="mb-3 text-base font-semibold text-neutral-900">Atividades Complementares</h2>
        <activities-list :activities="activities" :error="activitiesError" :show-user="false" :can-create="isSelf" @retry="fetchActivities" @select="onSelect" />
      </div>
    </div>

    <activities-detail-modal
      v-model:open="modalOpen"
      :activity="selectedActivity"
      @approved="onStatusChanged"
      @verified="onStatusChanged"
      @rejected="onStatusChanged"
    />

    <members-edit-modal v-if="user && canEdit" v-model:open="editOpen" :user="user" @updated="onUserUpdated" />
  </div>
</template>
