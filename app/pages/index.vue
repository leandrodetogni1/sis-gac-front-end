<script setup lang="ts">
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";
import type { SGTableColumn } from "~/types/SGTableColumn";

useHead({ title: "Dashboard — SWGAC" });

const { fetched, getMyActivities, filterByStatus } = useActivities();

const complementarColumns: SGTableColumn[] = [
  { key: "label", label: "Categoria" },
  { key: "min", label: "Min Horas", align: "right" },
  { key: "obtained", label: "Horas Obtidas", align: "right" },
];

const livreColumns: SGTableColumn[] = [
  { key: "description", label: "Descrição" },
  { key: "hours", label: "Horas", align: "right" },
];

const complementarCategories = computed(() => {
  const approved = filterByStatus("approved").filter((a) => a.class?.toLowerCase() === "complementar");

  const category = (a: ActivityResponseDto) => a.activity_types?.category?.toLowerCase() ?? "";
  const ensino = approved.filter((a) => category(a) === "ensino");
  const pesquisa = approved.filter((a) => category(a) === "pesquisa");
  const extensao = approved.filter((a) => category(a) === "extensao" || category(a) === "extensão");

  return [
    { label: "Ensino", min: 120, obtained: ensino.reduce((sum, a) => sum + (a.hours ?? 0), 0) },
    { label: "Pesquisa", min: 120, obtained: pesquisa.reduce((sum, a) => sum + (a.hours ?? 0), 0) },
    { label: "Extensão", min: 120, obtained: extensao.reduce((sum, a) => sum + (a.hours ?? 0), 0) },
  ];
});

const complementarTotal = computed(() => {
  return {
    min: complementarCategories.value.reduce((sum, c) => sum + c.min, 0),
    obtained: complementarCategories.value.reduce((sum, c) => sum + c.obtained, 0),
  };
});

const complementarApproved = computed(() => {
  return complementarTotal.value.obtained;
});

const livreHours = computed(() => {
  const approved = filterByStatus("approved").filter((a) => a.class?.toLowerCase() === "livre");
  return approved.reduce((sum, a) => sum + (a.hours ?? 0), 0);
});

const livreMin = 210;

const livreItems = computed(() => [
  { id: "lancada", description: "Lançada", hours: livreHours.value },
  { id: "aproveitada", description: "Aproveitada da Complementar", hours: 0 },
]);

const analysisMessages = computed(() => {
  const messages: { text: string; type: "warning" | "error" | "info" }[] = [];

  if (complementarTotal.value.obtained < complementarTotal.value.min) {
    messages.push({
      text: "Falta carga horária mínima em Atividades Complementares",
      type: "warning",
    });
  }

  const categoriesBelowMin = complementarCategories.value.filter((c) => c.obtained < c.min);
  if (categoriesBelowMin.length > 0) {
    const names = categoriesBelowMin.map((c) => c.label).join(" ou ");
    messages.push({
      text: `Falta carga horária mínima em ${categoriesBelowMin.length} das ${complementarCategories.value.length} categorias (${names} - mínimo 120h em uma delas).`,
      type: "error",
    });
  }

  if (livreHours.value < livreMin) {
    messages.push({
      text: "A carga horária em Formação Livre deve ser completada (min 210h, podendo aproveitar disciplinas fora do currículo ou optativas excedentes - além das exigidas no currículo).",
      type: "info",
    });
  }

  return messages;
});

onMounted(async () => {
  await getMyActivities();
});
</script>

<template>
  <div>
    <div v-if="!fetched" class="flex min-h-[60vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando dados...</p>
      </div>
    </div>

    <div v-else class="flex flex-col gap-6">
      <div class="grid gap-6 lg:grid-cols-2">
        <SGCard test-id="card-complementar">
          <h2 class="mb-4 text-base font-semibold text-neutral-900 md:text-lg">Atividades Complementares</h2>
          <SGTable
            :columns="complementarColumns"
            :items="complementarCategories"
            item-key="label"
            :hoverable="false"
            test-id="complementar-table"
          >
            <template #cell-label="{ item: cat }">
              <span class="font-medium text-neutral-900">{{ cat.label }}</span>
            </template>

            <template #cell-min="{ item: cat }">
              <span class="text-neutral-500">{{ cat.min }}h</span>
            </template>

            <template #cell-obtained="{ item: cat }">
              <span class="font-medium" :class="cat.obtained >= cat.min ? 'text-success-600' : 'text-error-500'">
                {{ cat.obtained }}h
              </span>
            </template>

            <template #footer>
              <tr class="border-t-2 border-neutral-300 font-semibold">
                <td class="py-3 pr-4 text-neutral-900">Total</td>
                <td class="py-3 pr-4 text-right text-neutral-500">{{ complementarTotal.min }}h</td>
                <td class="py-3 text-right" :class="complementarTotal.obtained >= complementarTotal.min ? 'text-success-600' : 'text-error-500'">
                  {{ complementarTotal.obtained }}h
                </td>
              </tr>
              <tr class="font-semibold">
                <td class="py-2 pr-4 text-neutral-900">Aproveitado</td>
                <td />
                <td class="py-2 text-right text-neutral-900">{{ complementarApproved }}h</td>
              </tr>
            </template>
          </SGTable>
        </SGCard>

        <SGCard test-id="card-analysis">
          <h2 class="mb-4 text-base font-semibold text-neutral-900 md:text-lg">Análise</h2>
          <div v-if="analysisMessages.length === 0" class="flex items-center gap-2 text-sm text-success-600">
            <Icon name="lucide:check-circle" size="1.25rem" />
            <span>Todas as exigências foram cumpridas.</span>
          </div>
          <div v-else class="flex flex-col gap-3">
            <div
              v-for="(msg, index) in analysisMessages"
              :key="index"
              class="flex items-start gap-2 rounded-lg p-3 text-sm"
              :class="{
                'bg-warning-50 text-warning-700': msg.type === 'warning',
                'bg-error-50 text-error-600': msg.type === 'error',
                'bg-primary-50 text-primary-700': msg.type === 'info',
              }"
            >
              <Icon
                :name="msg.type === 'error' ? 'lucide:alert-circle' : msg.type === 'warning' ? 'lucide:alert-triangle' : 'lucide:info'"
                size="1.25rem"
                class="mt-0.5 shrink-0"
              />
              <span>{{ msg.text }}</span>
            </div>
          </div>
        </SGCard>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <SGCard test-id="card-livre">
          <h2 class="mb-4 text-base font-semibold text-neutral-900 md:text-lg">Atividades — Formação Livre</h2>
          <SGTable
            :columns="livreColumns"
            :items="livreItems"
            :hoverable="false"
            test-id="livre-table"
          >
            <template #cell-description="{ item }">
              <span class="font-medium text-neutral-900">{{ item.description }}</span>
            </template>

            <template #cell-hours="{ item }">
              <span class="text-neutral-500">{{ item.hours }}h</span>
            </template>

            <template #footer>
              <tr class="border-t-2 border-neutral-300 font-semibold">
                <td class="py-3 pr-4 text-neutral-900">Total</td>
                <td class="py-3 text-right" :class="livreHours >= livreMin ? 'text-success-600' : 'text-error-500'">{{ livreHours }}h</td>
              </tr>
            </template>
          </SGTable>
        </SGCard>
      </div>
    </div>
  </div>
</template>
