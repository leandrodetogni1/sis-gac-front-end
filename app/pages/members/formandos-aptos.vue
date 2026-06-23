<script setup lang="ts">
import { Course, CourseLabels } from "~/enums/Course";
import type { SGTableColumn } from "~/types/SGTableColumn";
import type { FormandoAptoItemDto } from "~/interfaces/FormandoAptoResponseDto";

useHead({ title: "Formandos Aptos — SISGAC" });

const { user } = useAuthState();

if (user.value && user.value.role !== "admin" && user.value.role !== "owner" && user.value.role !== "reviewer") {
  await navigateTo("/");
}

const { loading, error, getFormandosAptos } = useUsers();

const items = ref<FormandoAptoItemDto[]>([]);
const total = ref(0);

const fetchFormandos = async () => {
  const data = await getFormandosAptos();
  items.value = data.items;
  total.value = data.total;
};

const columns: SGTableColumn[] = [
  { key: "name", label: "Nome" },
  { key: "matricula", label: "Matrícula" },
  { key: "email", label: "Email" },
  { key: "course", label: "Curso" },
  { key: "hoursEnsino", label: "Ensino (h)", align: "right" },
  { key: "hoursPesquisa", label: "Pesquisa (h)", align: "right" },
  { key: "hoursExtensao", label: "Extensão (h)", align: "right" },
  { key: "hoursComplementar", label: "Complementares (h)", align: "right" },
  { key: "hoursLivre", label: "Livres (h)", align: "right" },
];

const formatCourse = (value: string | null) => {
  if (!value) return "—";
  return CourseLabels[value as Course] ?? value;
};

const downloadExport = (format: "xlsx" | "pdf") => {
  window.open(`/api/users/formandos-aptos/export?format=${format}`, "_blank");
};

onMounted(fetchFormandos);
</script>

<template>
  <div>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <members-tabs />
      <div class="flex flex-wrap items-center gap-3">
        <span v-if="!loading" class="text-sm font-medium tabular-nums text-neutral-500" data-testid="formandos-aptos-total">
          {{ total }} aluno(s) apto(s) a colar grau
        </span>
        <div v-if="total > 0" class="flex items-center gap-2">
          <SGButton variant="secondary" icon="lucide:file-spreadsheet" size="sm" test-id="export-xlsx" @click="downloadExport('xlsx')">
            Exportar XLSX
          </SGButton>
          <SGButton variant="primary" icon="lucide:file-text" size="sm" test-id="export-pdf" @click="downloadExport('pdf')">
            Exportar PDF
          </SGButton>
        </div>
      </div>
    </div>

    <SGCard test-id="card-formandos-aptos">
      <SGTable
        :columns="columns"
        :items="items"
        :loading="loading"
        :error="error"
        loading-text="Carregando formandos aptos..."
        error-text="Falha ao carregar formandos aptos"
        empty-text="Nenhum formando atingiu todos os requisitos ainda."
        empty-description="Assim que um provável formando cumprir todas as horas, ele aparecerá aqui."
        empty-icon="lucide:award"
        test-id="formandos-aptos-table"
        @retry="fetchFormandos"
      >
        <template #cell-name="{ item: formando }">
          <div class="flex items-center gap-2.5">
            <SGAvatar :first-name="formando.firstName" :last-name="formando.lastName" :picture="null" size="sm" />
            <span class="font-medium text-neutral-900">{{ formando.firstName }} {{ formando.lastName }}</span>
          </div>
        </template>

        <template #cell-matricula="{ item: formando }">
          <span class="text-neutral-500">{{ formando.matricula ?? "—" }}</span>
        </template>

        <template #cell-email="{ item: formando }">
          <span class="text-neutral-500">{{ formando.email }}</span>
        </template>

        <template #cell-course="{ item: formando }">
          <span class="text-neutral-500">{{ formatCourse(formando.course) }}</span>
        </template>

        <template #cell-hoursEnsino="{ item: formando }">
          <span class="tabular-nums text-neutral-700">{{ formando.hoursEnsino }}</span>
        </template>

        <template #cell-hoursPesquisa="{ item: formando }">
          <span class="tabular-nums text-neutral-700">{{ formando.hoursPesquisa }}</span>
        </template>

        <template #cell-hoursExtensao="{ item: formando }">
          <span class="tabular-nums text-neutral-700">{{ formando.hoursExtensao }}</span>
        </template>

        <template #cell-hoursComplementar="{ item: formando }">
          <span class="tabular-nums text-neutral-700">{{ formando.hoursComplementar }}</span>
        </template>

        <template #cell-hoursLivre="{ item: formando }">
          <span class="tabular-nums text-neutral-700">{{ formando.hoursLivre }}</span>
        </template>

        <template #mobile="{ item: formando }">
          <div class="flex items-center gap-2.5">
            <SGAvatar :first-name="formando.firstName" :last-name="formando.lastName" :picture="null" size="sm" />
            <div class="min-w-0">
              <p class="font-medium text-neutral-900">{{ formando.firstName }} {{ formando.lastName }}</p>
              <p class="truncate text-sm text-neutral-500">{{ formando.email }}</p>
            </div>
          </div>
          <div class="mt-2 flex flex-col gap-1.5 text-sm text-neutral-500">
            <span>{{ formando.matricula ?? "—" }} · {{ formatCourse(formando.course) }}</span>
            <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
              <span>Ensino: {{ formando.hoursEnsino }}h</span>
              <span>Pesquisa: {{ formando.hoursPesquisa }}h</span>
              <span>Extensão: {{ formando.hoursExtensao }}h</span>
              <span>Complementares: {{ formando.hoursComplementar }}h</span>
              <span>Livres: {{ formando.hoursLivre }}h</span>
            </div>
          </div>
        </template>
      </SGTable>
    </SGCard>
  </div>
</template>
