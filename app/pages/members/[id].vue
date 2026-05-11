<script setup lang="ts">
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";
import type { UserResponseDto } from "~/interfaces/UserResponseDto";

const route = useRoute();
const router = useRouter();

const memberId = computed(() => route.params.id as string);

const { getUser } = useUsers();
const { activities, error: activitiesError, fetched, getActivitiesByUser } = useActivities();

const user = ref<UserResponseDto | null>(null);
const userError = ref<string | null>(null);
const pageLoading = ref(true);

const selectedActivity = ref<ActivityResponseDto | null>(null);
const modalOpen = ref(false);

const fullName = computed(() => {
  if (!user.value) return "—";
  return `${user.value.firstName} ${user.value.lastName}`;
});

const initials = computed(() => {
  if (!user.value) return "?";
  return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase();
});

const roleLabel = computed(() => {
  const role = user.value?.role;
  if (!role) return "—";
  const map: Record<string, string> = {
    admin: "Administrador",
    coordinator: "Coordenador",
    student: "Aluno",
    coach: "Orientador",
  };
  return map[role.toLowerCase()] ?? role;
});

const createdAt = computed(() => formatDateTimeBR(user.value?.createdAt));

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
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
              {{ initials }}
            </div>
            <div class="min-w-0 flex-1">
              <h1 class="text-lg font-semibold text-neutral-900">{{ fullName }}</h1>
              <p class="text-sm text-neutral-500">{{ user.email }}</p>
            </div>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 text-sm md:grid-cols-3">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-neutral-400">Perfil</p>
              <p class="mt-0.5 font-medium text-neutral-900">{{ roleLabel }}</p>
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
  </div>
</template>
