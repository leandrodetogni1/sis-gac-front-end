<script setup lang="ts">
import { Course, CourseLabels } from "~/enums/Course";
import { CurriculumYear, CurriculumYearLabels } from "~/enums/CurriculumYear";
import { Situation } from "~/enums/Situation";
import type { AdminDashboardFormando } from "~/interfaces/AdminDashboardResponseDto";
import type { SGTableColumn } from "~/types/SGTableColumn";

defineProps<{
  formandos: AdminDashboardFormando[];
}>();

const columns: SGTableColumn[] = [
  { key: "name", label: "Aluno" },
  { key: "matricula", label: "Matrícula" },
  { key: "course", label: "Curso" },
  { key: "curriculumYear", label: "Currículo" },
  { key: "status", label: "Pendência", align: "right" },
];

const formatCourse = (value: Course | null) => {
  if (!value) return "—";
  return CourseLabels[value] ?? value;
};

const formatCurriculum = (value: CurriculumYear | null) => {
  if (!value) return "—";
  return CurriculumYearLabels[value] ?? value;
};

const handleRowClick = (formando: AdminDashboardFormando) => {
  navigateTo(`/members/${formando.user.id}`);
};
</script>

<template>
  <SGCard test-id="admin-formandos-at-risk">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold text-neutral-900 md:text-lg">Formandos</h3>
        <p class="mt-1 text-xs text-neutral-500">Ordenados pelo maior total de horas faltantes</p>
      </div>
      <NuxtLink
        :to="{ path: '/members', query: { situation: Situation.FORMANDO } }"
        class="-m-2 inline-flex shrink-0 items-center gap-1 p-2 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
        data-testid="formandos-ver-todos"
      >
        Ver todos
        <Icon name="lucide:chevron-right" size="0.875rem" />
      </NuxtLink>
    </div>

    <SGTable
      :columns="columns"
      :items="formandos"
      empty-text="Nenhum formando com pendência"
      empty-description="Todos os prováveis formandos atingiram as horas mínimas."
      empty-icon="lucide:check-circle"
      test-id="formandos-table"
      clickable
      @row-click="handleRowClick"
    >
      <template #cell-name="{ item: formando }">
        <div class="flex items-center gap-2.5">
          <SGAvatar :first-name="formando.user.firstName" :last-name="formando.user.lastName" :picture="formando.user.picture" size="sm" />
          <span class="font-medium text-neutral-900">{{ formando.user.firstName }} {{ formando.user.lastName }}</span>
        </div>
      </template>

      <template #cell-matricula="{ item: formando }">
        <span class="text-neutral-500">{{ formando.user.matricula ?? "—" }}</span>
      </template>

      <template #cell-course="{ item: formando }">
        <span class="text-neutral-500">{{ formatCourse(formando.user.course) }}</span>
      </template>

      <template #cell-curriculumYear="{ item: formando }">
        <span class="text-neutral-500">{{ formatCurriculum(formando.user.curriculumYear) }}</span>
      </template>

      <template #cell-status="{ item: formando }">
        <span
          v-if="formando.isReadyToGraduate"
          class="inline-flex items-center gap-1 rounded-full border border-success-200 bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700"
          :data-testid="`formando-ready-badge-${formando.user.id}`"
        >
          <Icon name="lucide:check-circle" size="0.875rem" />
          Pronto para colar grau
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1 rounded-full border border-error-200 bg-error-50 px-2.5 py-1 text-xs font-semibold text-error-600"
          :data-testid="`formando-total-gap-${formando.user.id}`"
        >
          <Icon name="lucide:clock" size="0.875rem" />
          Faltam {{ formando.totalGap }}h
        </span>
      </template>

      <template #mobile="{ item: formando }">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <SGAvatar :first-name="formando.user.firstName" :last-name="formando.user.lastName" :picture="formando.user.picture" size="sm" />
            <div>
              <p class="font-medium text-neutral-900">{{ formando.user.firstName }} {{ formando.user.lastName }}</p>
              <p class="text-xs text-neutral-500">{{ formando.user.matricula ?? "—" }} · {{ formatCourse(formando.user.course) }}</p>
            </div>
          </div>
          <span
            v-if="formando.isReadyToGraduate"
            class="inline-flex shrink-0 items-center gap-1 rounded-full border border-success-200 bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700"
          >
            <Icon name="lucide:check-circle" size="0.875rem" />
            Pronto
          </span>
          <span
            v-else
            class="inline-flex shrink-0 items-center gap-1 rounded-full border border-error-200 bg-error-50 px-2.5 py-1 text-xs font-semibold text-error-600"
          >
            <Icon name="lucide:clock" size="0.875rem" />
            Faltam {{ formando.totalGap }}h
          </span>
        </div>
      </template>
    </SGTable>
  </SGCard>
</template>
