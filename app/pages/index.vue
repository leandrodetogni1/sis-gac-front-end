<script setup lang="ts">
useHead({ title: "Dashboard — SWGAC" });

const { fetched, getActivities, filterByStatus } = useActivities();

const complementarCategories = computed(() => {
  const approved = filterByStatus("approved").filter((a) => a.type === "complementar");

  const ensino = approved.filter((a) => a.title.toLowerCase().includes("monitoria") || a.title.toLowerCase().includes("ensino"));
  const pesquisa = approved.filter((a) => a.title.toLowerCase().includes("científica") || a.title.toLowerCase().includes("artigo") || a.title.toLowerCase().includes("pesquisa"));
  const extensao = approved.filter((a) => a.title.toLowerCase().includes("extensão") || a.title.toLowerCase().includes("voluntário") || a.title.toLowerCase().includes("comunitár"));

  return [
    { label: "Ensino", min: 120, obtained: ensino.reduce((sum, a) => sum + a.hours, 0) },
    { label: "Pesquisa", min: 120, obtained: pesquisa.reduce((sum, a) => sum + a.hours, 0) },
    { label: "Extensão", min: 120, obtained: extensao.reduce((sum, a) => sum + a.hours, 0) },
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
  const approved = filterByStatus("approved").filter((a) => a.type === "livre");
  return approved.reduce((sum, a) => sum + a.hours, 0);
});

const livreMin = 210;

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
  await getActivities();
});
</script>

<template>
  <div>
    <div
      v-if="!fetched"
      class="flex min-h-[60vh] items-center justify-center"
      data-testid="page-loading"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando dados...</p>
      </div>
    </div>

    <div v-else class="flex flex-col gap-6">
      <div class="grid gap-6 lg:grid-cols-2">
        <SGCard test-id="card-complementar">
          <h2 class="mb-4 text-base font-semibold text-neutral-900 md:text-lg">
            Atividades Complementares
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm" data-testid="complementar-table">
              <thead>
                <tr class="border-b border-neutral-200 text-xs font-medium uppercase text-neutral-500">
                  <th class="pb-3 pr-4">Categoria</th>
                  <th class="pb-3 pr-4 text-right">Min Horas</th>
                  <th class="pb-3 text-right">Horas Obtidas</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="cat in complementarCategories"
                  :key="cat.label"
                  class="border-b border-neutral-100"
                >
                  <td class="py-3 pr-4 font-medium text-neutral-900">{{ cat.label }}</td>
                  <td class="py-3 pr-4 text-right text-neutral-500">{{ cat.min }}h</td>
                  <td
                    class="py-3 text-right font-medium"
                    :class="cat.obtained >= cat.min ? 'text-success-600' : 'text-error-500'"
                  >
                    {{ cat.obtained }}h
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-neutral-300 font-semibold">
                  <td class="py-3 pr-4 text-neutral-900">Total</td>
                  <td class="py-3 pr-4 text-right text-neutral-500">{{ complementarTotal.min }}h</td>
                  <td
                    class="py-3 text-right"
                    :class="complementarTotal.obtained >= complementarTotal.min ? 'text-success-600' : 'text-error-500'"
                  >
                    {{ complementarTotal.obtained }}h
                  </td>
                </tr>
                <tr class="font-semibold">
                  <td class="py-2 pr-4 text-neutral-900">Aproveitado</td>
                  <td />
                  <td class="py-2 text-right text-neutral-900">{{ complementarApproved }}h</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </SGCard>

        <SGCard test-id="card-analysis">
          <h2 class="mb-4 text-base font-semibold text-neutral-900 md:text-lg">
            Análise
          </h2>
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
          <h2 class="mb-4 text-base font-semibold text-neutral-900 md:text-lg">
            Atividades — Formação Livre
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm" data-testid="livre-table">
              <thead>
                <tr class="border-b border-neutral-200 text-xs font-medium uppercase text-neutral-500">
                  <th class="pb-3 pr-4">Descrição</th>
                  <th class="pb-3 text-right">Horas</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-neutral-100">
                  <td class="py-3 pr-4 font-medium text-neutral-900">Lançada</td>
                  <td class="py-3 text-right text-neutral-500">{{ livreHours }}h</td>
                </tr>
                <tr class="border-b border-neutral-100">
                  <td class="py-3 pr-4 font-medium text-neutral-900">Aproveitada da Complementar</td>
                  <td class="py-3 text-right text-neutral-500">0h</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-neutral-300 font-semibold">
                  <td class="py-3 pr-4 text-neutral-900">Total</td>
                  <td
                    class="py-3 text-right"
                    :class="livreHours >= livreMin ? 'text-success-600' : 'text-error-500'"
                  >
                    {{ livreHours }}h
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </SGCard>

      </div>
    </div>
  </div>
</template>
