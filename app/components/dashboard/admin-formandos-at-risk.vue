<script setup lang="ts">
import { Course, CourseLabels } from "~/enums/Course";
import { CurriculumYear, CurriculumYearLabels } from "~/enums/CurriculumYear";
import type {
  AdminDashboardFormando,
  AdminDashboardFormandoUser,
} from "~/interfaces/AdminDashboardResponseDto";
import type { SummaryCategory } from "~/interfaces/MeSummaryResponseDto";

defineProps<{
  formandos: AdminDashboardFormando[];
}>();

const CATEGORY_LABELS: Record<SummaryCategory, string> = {
  ENSINO: "Ensino",
  PESQUISA: "Pesquisa",
  EXTENSAO: "Extensão",
};

const goToMember = (user: AdminDashboardFormandoUser) => {
  navigateTo(`/members/${user.id}`);
};

const formatCourse = (value: Course | null) => {
  if (!value) return "—";
  return CourseLabels[value] ?? value;
};

const formatCurriculum = (value: CurriculumYear | null) => {
  if (!value) return "—";
  return CurriculumYearLabels[value] ?? value;
};

const progressPct = (achieved: number, required: number) => {
  if (required <= 0) return 0;
  return Math.min(100, Math.max(0, (achieved / required) * 100));
};

const barColor = (achieved: number, required: number, gap: number) => {
  if (gap === 0) return "bg-success-500";
  if (progressPct(achieved, required) < 50) return "bg-error-500";
  return "bg-warning-500";
};

const hasComplementarBreakdown = (formando: AdminDashboardFormando) => {
  return formando.complementaryGap > 0 || formando.categoryGaps.some((c) => c.gap > 0);
};
</script>

<template>
  <SGCard test-id="admin-formandos-at-risk">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold text-neutral-900 md:text-lg">Formandos a destravar</h3>
        <p class="mt-1 text-xs text-neutral-500">
          Ordenados pelo maior total de horas faltantes
        </p>
      </div>
      <Icon name="lucide:graduation-cap" size="1.5rem" class="text-primary-500" />
    </div>

    <div v-if="formandos.length === 0" class="mt-6 flex flex-col items-center gap-2 text-center" data-testid="formandos-empty">
      <Icon name="lucide:party-popper" size="2rem" class="text-success-600" />
      <p class="text-sm font-medium text-neutral-900">Nenhum formando com pendência</p>
      <p class="text-xs text-neutral-500">Todos os prováveis formandos atingiram as horas mínimas.</p>
    </div>

    <ul v-else class="mt-4 flex flex-col gap-3" data-testid="formandos-list">
      <li
        v-for="formando in formandos"
        :key="formando.user.id"
        class="cursor-pointer rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/30"
        :data-testid="`formando-card-${formando.user.id}`"
        @click="goToMember(formando.user)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <SGAvatar
              :first-name="formando.user.firstName"
              :last-name="formando.user.lastName"
              :picture="formando.user.picture"
              size="lg"
            />
            <div class="min-w-0">
              <p class="truncate font-medium text-neutral-900">
                {{ formando.user.firstName }} {{ formando.user.lastName }}
              </p>
              <p class="truncate text-xs text-neutral-500">
                {{ formando.user.matricula ?? "—" }} · {{ formatCourse(formando.user.course) }} · Currículo {{ formatCurriculum(formando.user.curriculumYear) }}
              </p>
              <p class="mt-1 text-xs text-neutral-500">
                <span class="font-medium text-neutral-700">{{ formando.totalHoursApproved }}h</span> aprovadas
              </p>
            </div>
          </div>

          <span
            v-if="formando.isReadyToGraduate"
            class="inline-flex shrink-0 items-center gap-1 rounded-full border border-success-200 bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700"
            data-testid="formando-ready-badge"
          >
            <Icon name="lucide:check-circle" size="0.875rem" />
            Pronto para colar grau
          </span>
          <span
            v-else
            class="inline-flex shrink-0 items-center gap-1 rounded-full border border-error-200 bg-error-50 px-2.5 py-1 text-xs font-semibold text-error-600"
            :data-testid="`formando-total-gap-${formando.user.id}`"
          >
            <Icon name="lucide:clock" size="0.875rem" />
            Faltam {{ formando.totalGap }}h
          </span>
        </div>

        <div
          v-if="!formando.isReadyToGraduate"
          class="mt-4 grid gap-4 border-t border-neutral-100 pt-4 md:grid-cols-2"
          :data-testid="`formando-breakdown-${formando.user.id}`"
        >
          <section
            v-if="hasComplementarBreakdown(formando)"
            class="rounded-lg border border-neutral-200 bg-neutral-50/60 p-3"
            data-testid="breakdown-complementar"
          >
            <header class="flex items-center justify-between gap-2 pb-2">
              <div class="flex items-center gap-1.5">
                <Icon name="lucide:book-open" size="0.875rem" class="text-neutral-500" />
                <h4 class="text-xs font-semibold uppercase tracking-wide text-neutral-700">
                  Complementares
                </h4>
              </div>
              <span class="text-xs font-semibold text-error-600">
                faltam {{ formando.complementaryGap }}h
              </span>
            </header>

            <ul class="flex flex-col gap-2.5">
              <li
                v-for="cat in formando.categoryGaps"
                :key="cat.category"
                class="flex flex-col gap-1"
              >
                <div class="flex items-center justify-between text-xs">
                  <span class="font-medium text-neutral-700">
                    {{ CATEGORY_LABELS[cat.category] ?? cat.category }}
                  </span>
                  <span
                    class="tabular-nums"
                    :class="cat.gap === 0 ? 'text-success-600' : 'text-neutral-600'"
                  >
                    {{ cat.achieved }}h / {{ cat.required }}h
                    <span v-if="cat.gap > 0" class="ml-1 font-semibold text-error-600">
                      (-{{ cat.gap }}h)
                    </span>
                  </span>
                </div>
                <div class="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="barColor(cat.achieved, cat.required, cat.gap)"
                    :style="{ width: `${progressPct(cat.achieved, cat.required)}%` }"
                  />
                </div>
              </li>
            </ul>
          </section>

          <section
            v-if="formando.freeGap > 0"
            class="rounded-lg border border-neutral-200 bg-neutral-50/60 p-3"
            data-testid="breakdown-livre"
          >
            <header class="flex items-center justify-between gap-2 pb-2">
              <div class="flex items-center gap-1.5">
                <Icon name="lucide:compass" size="0.875rem" class="text-neutral-500" />
                <h4 class="text-xs font-semibold uppercase tracking-wide text-neutral-700">
                  Formação Livre
                </h4>
              </div>
              <span class="text-xs font-semibold text-error-600">
                faltam {{ formando.freeGap }}h
              </span>
            </header>

            <p class="text-xs leading-relaxed text-neutral-600">
              Carga horária mínima em disciplinas optativas ou disciplinas aproveitadas fora do currículo regular.
            </p>
          </section>
        </div>
      </li>
    </ul>
  </SGCard>
</template>
