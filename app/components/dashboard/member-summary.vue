<script setup lang="ts">
import type { MeSummaryResponseDto, SummaryCategory } from "~/interfaces/MeSummaryResponseDto";

const props = defineProps<{
  userId?: string;
}>();

const { getUserSummary } = useActivities();
const { user } = useAuthState();

const summary = ref<MeSummaryResponseDto | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const targetUserId = computed(() => props.userId ?? user.value?.id);
const isSelf = computed(() => !props.userId || props.userId === user.value?.id);

const fetchSummary = async () => {
  if (!targetUserId.value) {
    error.value = "Usuário não autenticado";
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    summary.value = await getUserSummary(targetUserId.value);
  } catch (e: any) {
    error.value = e?.data?.message ?? "Erro ao carregar resumo";
  } finally {
    loading.value = false;
  }
};

watch(targetUserId, async (id, prev) => {
  if (id && id !== prev) await fetchSummary();
});

defineExpose({ refresh: fetchSummary });

const CATEGORY_LABELS: Record<SummaryCategory, string> = {
  ENSINO: "Ensino",
  PESQUISA: "Pesquisa",
  EXTENSAO: "Extensão",
};

const needsCurriculum = computed(() => summary.value?.curriculum.curriculumYear === null);

const complementaryExcess = computed(() => {
  const c = summary.value?.complementaryProgress;
  if (!c) return 0;
  return Math.max(0, c.totalRawHours - c.totalCountedHours);
});

const fmtHours = (n: number) => formatHours(n);
const fmtTarget = (n: number | null) => (n === null ? "—" : fmtHours(n));

onMounted(async () => {
  await fetchSummary();
});
</script>

<template>
  <div>
    <div v-if="loading && !summary" class="flex min-h-[60vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-muted">Carregando dados...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex min-h-[60vh] items-center justify-center">
      <div class="flex flex-col items-center gap-3 text-center">
        <Icon name="lucide:alert-circle" size="2rem" class="text-error-500" />
        <p class="text-sm text-default">{{ error }}</p>
        <SGButton variant="secondary" size="sm" @click="fetchSummary">Tentar novamente</SGButton>
      </div>
    </div>

    <div v-else-if="summary" class="flex flex-col gap-6">
      <dashboard-curriculum-banner v-if="needsCurriculum && isSelf" @saved="fetchSummary" />

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SGCard
          v-for="entry in summary.categoryProgress"
          :key="entry.category"
          :test-id="`card-category-${entry.category.toLowerCase()}`"
        >
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-sm font-semibold text-highlighted">{{ CATEGORY_LABELS[entry.category] }}</h3>
            <Icon
              v-if="entry.meetsMinimum"
              name="lucide:check-circle"
              size="1.1rem"
              class="text-success-600"
            />
          </div>
          <p class="mt-2 text-2xl font-semibold text-highlighted">
            {{ fmtHours(entry.hoursAchieved) }}
          </p>
          <p class="text-xs text-muted">de {{ fmtTarget(entry.minRequired) }} mínimas</p>
          <div class="mt-3">
            <dashboard-progress-bar
              :achieved="entry.hoursAchieved"
              :target="entry.minRequired"
              :meets-minimum="entry.meetsMinimum"
            />
          </div>
        </SGCard>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <SGCard test-id="card-complementary">
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-base font-semibold text-highlighted">Atividades Complementares</h3>
            <Icon
              v-if="summary.complementaryProgress.meetsMinimum"
              name="lucide:check-circle"
              size="1.25rem"
              class="text-success-600"
            />
          </div>
          <p class="mt-2 text-2xl font-semibold text-highlighted">
            {{ fmtHours(summary.complementaryProgress.totalCountedHours) }}
          </p>
          <p class="text-xs text-muted">
            de {{ fmtTarget(summary.complementaryProgress.minRequired) }} mínimas
          </p>
          <div class="mt-3">
            <dashboard-progress-bar
              :achieved="summary.complementaryProgress.totalCountedHours"
              :target="summary.complementaryProgress.minRequired"
              :meets-minimum="summary.complementaryProgress.meetsMinimum"
            />
          </div>
          <p
            v-if="complementaryExcess > 0"
            class="mt-3 rounded-md border border-primary-200 bg-primary-50 px-3 py-2 text-xs text-primary-800 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-200"
          >
            {{ fmtHours(complementaryExcess) }} excedentes foram transferidas para Formação Livre.
          </p>
        </SGCard>

        <SGCard test-id="card-free">
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-base font-semibold text-highlighted">Formação Livre</h3>
            <Icon
              v-if="summary.freeProgress.meetsMinimum"
              name="lucide:check-circle"
              size="1.25rem"
              class="text-success-600"
            />
          </div>
          <p class="mt-2 text-2xl font-semibold text-highlighted">
            {{ fmtHours(summary.freeProgress.totalHours) }}
          </p>
          <p class="text-xs text-muted">de {{ fmtTarget(summary.freeProgress.minRequired) }} mínimas</p>
          <div class="mt-3">
            <dashboard-progress-bar
              :achieved="summary.freeProgress.totalHours"
              :target="summary.freeProgress.minRequired"
              :meets-minimum="summary.freeProgress.meetsMinimum"
            />
          </div>
          <div class="mt-3 grid grid-cols-2 gap-3 text-xs text-muted">
            <div>
              <p class="font-medium text-toned">Lançadas</p>
              <p>{{ fmtHours(summary.freeProgress.loggedHours) }}</p>
            </div>
            <div>
              <p class="font-medium text-toned">Aproveitadas</p>
              <p>{{ fmtHours(summary.freeProgress.carriedOverFromComplementary) }}</p>
            </div>
          </div>
        </SGCard>
      </div>

      <SGCard v-if="summary.cappedTypes.length > 0" test-id="card-capped-types">
        <h3 class="text-base font-semibold text-highlighted">Tetos atingidos</h3>
        <p class="mt-1 text-xs text-muted">
          Horas extras nesses tipos são transferidas para Formação Livre.
        </p>
        <ul class="mt-3 flex flex-col gap-2">
          <li
            v-for="capped in summary.cappedTypes"
            :key="capped.cod"
            class="flex items-start gap-2 rounded-md bg-warning-50 px-3 py-2 text-sm text-warning-800 dark:bg-warning-950/40 dark:text-warning-200"
          >
            <Icon name="lucide:alert-triangle" size="1rem" class="mt-0.5 shrink-0" />
            <div>
              <p class="font-medium">{{ capped.label }} ({{ capped.cod }})</p>
              <p class="text-xs">
                {{ fmtHours(capped.hoursAchieved) }} de {{ fmtHours(capped.maxAllowed) }} permitidas.
              </p>
            </div>
          </li>
        </ul>
      </SGCard>

      <SGCard test-id="card-overall">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p class="text-xs font-medium uppercase text-muted">Total</p>
            <p class="mt-1 text-lg font-semibold text-highlighted">{{ summary.totalActivities }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Aprovadas</p>
            <p class="mt-1 text-lg font-semibold text-highlighted">{{ summary.byStatus.APPROVED.count }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Em análise</p>
            <p class="mt-1 text-lg font-semibold text-highlighted">
              {{ summary.byStatus.PENDING.count + summary.byStatus.VERIFIED.count }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Horas aprovadas</p>
            <p class="mt-1 text-lg font-semibold text-highlighted">{{ fmtHours(summary.totalHoursApproved) }}</p>
          </div>
        </div>
      </SGCard>
    </div>
  </div>
</template>
