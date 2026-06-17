<script setup lang="ts">
import { Course, CourseLabels } from "~/enums/Course";
import { CurriculumYear, CurriculumYearLabels } from "~/enums/CurriculumYear";
import { Situation } from "~/enums/Situation";
import type { AdminDashboardRegularStudent } from "~/interfaces/AdminDashboardResponseDto";
import type { SGTableColumn } from "~/types/SGTableColumn";

defineProps<{
  students: AdminDashboardRegularStudent[];
}>();

const columns: SGTableColumn[] = [
  { key: "name", label: "Aluno" },
  { key: "matricula", label: "Matrícula" },
  { key: "course", label: "Curso" },
  { key: "curriculumYear", label: "Currículo" },
  { key: "totalHoursApproved", label: "Total", align: "right" },
  { key: "complementaryHours", label: "Complementar", align: "right" },
  { key: "freeHours", label: "Livre", align: "right" },
  { key: "categoryHours", label: "Ens / Pesq / Ext", align: "right" },
];

const formatCourse = (value: Course | null) => {
  if (!value) return "—";
  return CourseLabels[value] ?? value;
};

const formatCurriculum = (value: CurriculumYear | null) => {
  if (!value) return "—";
  return CurriculumYearLabels[value] ?? value;
};

const handleRowClick = (student: AdminDashboardRegularStudent) => {
  navigateTo(`/members/${student.user.id}`);
};
</script>

<template>
  <SGCard test-id="admin-regular-progress">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold text-neutral-900 md:text-lg">Alunos em andamento</h3>
        <p class="mt-1 text-xs text-neutral-500">Panorama dos alunos regulares</p>
      </div>
      <NuxtLink
        :to="{ path: '/members', query: { situation: Situation.REGULAR } }"
        class="-m-2 inline-flex shrink-0 items-center gap-1 p-2 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
        data-testid="regular-ver-todos"
      >
        Ver todos
        <Icon name="lucide:chevron-right" size="0.875rem" />
      </NuxtLink>
    </div>

    <SGTable
      :columns="columns"
      :items="students"
      empty-text="Nenhum aluno regular cadastrado"
      empty-description="Quando houver alunos com situação Regular, eles aparecem aqui."
      empty-icon="lucide:users"
      test-id="regular-students-table"
      clickable
      @row-click="handleRowClick"
    >
      <template #cell-name="{ item: student }">
        <div class="flex items-center gap-2.5">
          <SGAvatar :first-name="student.user.firstName" :last-name="student.user.lastName" :picture="student.user.picture" size="sm" />
          <span class="font-medium text-neutral-900">{{ student.user.firstName }} {{ student.user.lastName }}</span>
        </div>
      </template>

      <template #cell-matricula="{ item: student }">
        <span class="text-neutral-500">{{ student.user.matricula ?? "—" }}</span>
      </template>

      <template #cell-course="{ item: student }">
        <span class="text-neutral-500">{{ formatCourse(student.user.course) }}</span>
      </template>

      <template #cell-curriculumYear="{ item: student }">
        <span class="text-neutral-500">{{ formatCurriculum(student.user.curriculumYear) }}</span>
      </template>

      <template #cell-totalHoursApproved="{ item: student }">
        <span class="font-semibold text-neutral-900">{{ formatHours(student.totalHoursApproved) }}</span>
      </template>

      <template #cell-complementaryHours="{ item: student }">
        <span class="text-neutral-500">{{ formatHours(student.complementaryHours) }}</span>
      </template>

      <template #cell-freeHours="{ item: student }">
        <span class="text-neutral-500">{{ formatHours(student.freeHours) }}</span>
      </template>

      <template #cell-categoryHours="{ item: student }">
        <span class="text-neutral-500">
          {{ roundHours(student.categoryHours.ENSINO) }} / {{ roundHours(student.categoryHours.PESQUISA) }} / {{ roundHours(student.categoryHours.EXTENSAO) }}
        </span>
      </template>

      <template #mobile="{ item: student }">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <SGAvatar :first-name="student.user.firstName" :last-name="student.user.lastName" :picture="student.user.picture" size="sm" />
            <div>
              <p class="font-medium text-neutral-900">{{ student.user.firstName }} {{ student.user.lastName }}</p>
              <p class="text-xs text-neutral-500">{{ student.user.matricula ?? "—" }} · {{ formatCourse(student.user.course) }}</p>
            </div>
          </div>
          <Icon name="lucide:chevron-right" size="1.125rem" class="text-neutral-400" />
        </div>
        <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div>
            <p class="font-medium uppercase tracking-wide text-neutral-500">Total</p>
            <p class="mt-0.5 text-sm font-semibold text-neutral-900">{{ formatHours(student.totalHoursApproved) }}</p>
          </div>
          <div>
            <p class="font-medium uppercase tracking-wide text-neutral-500">Complementar</p>
            <p class="mt-0.5 text-sm font-semibold text-neutral-900">{{ formatHours(student.complementaryHours) }}</p>
          </div>
          <div>
            <p class="font-medium uppercase tracking-wide text-neutral-500">Livre</p>
            <p class="mt-0.5 text-sm font-semibold text-neutral-900">{{ formatHours(student.freeHours) }}</p>
          </div>
        </div>
        <p class="mt-2 text-xs text-neutral-500">
          Ens {{ formatHours(student.categoryHours.ENSINO) }} · Pesq {{ formatHours(student.categoryHours.PESQUISA) }} · Ext {{ formatHours(student.categoryHours.EXTENSAO) }}
        </p>
      </template>
    </SGTable>
  </SGCard>
</template>
