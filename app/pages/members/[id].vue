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

const canEdit = computed(() => {
  const role = currentUser.value?.role;
  return role === "admin" || role === "owner";
});

const user = ref<UserResponseDto | null>(null);
const userError = ref<string | null>(null);
const pageLoading = ref(true);

const selectedActivity = ref<ActivityResponseDto | null>(null);
const modalOpen = ref(false);

const editOpen = ref(false);

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
  await getActivitiesByUser(memberId.value);
};

onMounted(async () => {
  pageLoading.value = true;
  const [fetchedUser] = await Promise.all([
    getUser(memberId.value),
    getActivitiesByUser(memberId.value),
  ]);
  if (!fetchedUser) {
    userError.value = "Usuário não encontrado";
  } else {
    user.value = fetchedUser;
    useHead({ title: `${fetchedUser.firstName} ${fetchedUser.lastName} — SWGAC` });
  }
  pageLoading.value = false;
});
</script>

<template>
  <div>
    <div v-if="pageLoading" class="flex min-h-[60vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando dados...</p>
      </div>
    </div>

    <div v-else>
      <div class="mb-6 flex items-center gap-3">
        <button
          class="flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
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
            <SGAvatar
              :first-name="user.firstName"
              :last-name="user.lastName"
              :picture="user.picture"
              size="xl"
            />
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
              @click="editOpen = true"
            >
              Editar
            </SGButton>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 text-sm md:grid-cols-3 lg:grid-cols-5">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-400">Matrícula</p>
              <p class="mt-0.5 font-medium text-neutral-900 tabular-nums">{{ matriculaLabel }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-400">Curso</p>
              <p class="mt-0.5 font-medium text-neutral-900">{{ courseLabel }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-400">Currículo</p>
              <p class="mt-0.5 font-medium text-neutral-900">{{ curriculumLabel }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-400">Situação</p>
              <p class="mt-0.5 font-medium text-neutral-900">{{ situationLabel }}</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-400">Cadastrado em</p>
              <p class="mt-0.5 font-medium text-neutral-900">{{ createdAt }}</p>
            </div>
          </div>
        </SGCard>
      </div>

      <div>
        <h2 class="mb-3 text-base font-semibold text-neutral-900">Atividades Complementares</h2>
        <activities-list
          :activities="activities"
          :error="activitiesError"
          @retry="getActivitiesByUser(memberId)"
          @select="onSelect"
        />
      </div>
    </div>

    <activities-detail-modal
      v-model:open="modalOpen"
      :activity="selectedActivity"
      @approved="onStatusChanged"
      @verified="onStatusChanged"
      @rejected="onStatusChanged"
    />

    <members-edit-modal
      v-if="user && canEdit"
      v-model:open="editOpen"
      :user="user"
      @updated="onUserUpdated"
    />
  </div>
</template>
