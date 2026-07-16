<script setup lang="ts">
import type { SGTableColumn } from "~/types/SGTableColumn";

useHead({ title: "Currículos — Configurações — SISGAC" });

const router = useRouter();
const { user } = useAuthState();
const { curricula, fetched, loading, error, getCurricula } = useCurricula();

const canEdit = computed(() => user.value?.role === "owner");

const createModal = ref(false);

const columns: SGTableColumn[] = [
  { key: "year", label: "Ano" },
  { key: "minHoursPerCategory", label: "Min. horas / categoria" },
  { key: "minCategoriesRequired", label: "Min. categorias" },
  { key: "excessToFreeMultiplier", label: "Mult. excedente" },
  { key: "minFreeHours", label: "Min. horas livres" },
  { key: "chevron", label: "", align: "right" },
];

const existingYears = computed(() => curricula.value.map((c) => c.year));

const canCreate = computed(() => canEdit.value);

const formatNullable = (value: number | null): string => {
  if (value === null || value === undefined) return "—";
  return String(value);
};

const handleCreated = async () => {
  createModal.value = false;
  await getCurricula();
};

const goToDetail = (year: number | string) => {
  router.push(`/config/curriculos/${year}`);
};

onMounted(async () => {
  await getCurricula();
});
</script>

<template>
  <div>
    <div v-if="!fetched" data-testid="page-loading">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <SGSkeleton class="h-5 w-28 md:h-6" />
          <SGSkeleton class="mt-2 h-3 w-64" />
        </div>
        <SGSkeleton class="h-10 w-44 rounded-lg" />
      </div>

      <SGCard>
        <SGTableSkeleton mobile-cards :columns="6" :rows="5" />
      </SGCard>
    </div>

    <div v-else>
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Currículos</h2>
          <p class="mt-0.5 text-xs text-neutral-500">Regras globais, por curso e por tipo de atividade.</p>
        </div>
        <SGButton v-if="canCreate" test-id="add-curriculum-button" variant="primary" icon="lucide:plus" @click="createModal = true">
          Adicionar Currículo
        </SGButton>
      </div>

      <SGCard test-id="card-curricula">
        <SGTable
          :columns="columns"
          :items="curricula"
          :error="error"
          error-text="Falha ao carregar currículos"
          empty-text="Nenhum currículo cadastrado"
          empty-description="Adicione o primeiro currículo para começar a configurar regras."
          empty-icon="lucide:book-open"
          item-key="year"
          clickable
          test-id="curricula-table"
          @row-click="(c: any) => goToDetail(c.year)"
          @retry="getCurricula()"
        >
          <template #cell-year="{ item: c }">
            <span class="inline-flex items-center rounded-md bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-700">
              {{ c.year }}
            </span>
          </template>

          <template #cell-minHoursPerCategory="{ item: c }">
            <span class="text-neutral-700">{{ formatNullable(c.minHoursPerCategory) }}</span>
          </template>

          <template #cell-minCategoriesRequired="{ item: c }">
            <span class="text-neutral-700">{{ formatNullable(c.minCategoriesRequired) }}</span>
          </template>

          <template #cell-excessToFreeMultiplier="{ item: c }">
            <span class="text-neutral-700">{{ c.excessToFreeMultiplier }}×</span>
          </template>

          <template #cell-minFreeHours="{ item: c }">
            <span class="text-neutral-700">{{ c.minFreeHours }}h</span>
          </template>

          <template #cell-chevron>
            <Icon name="lucide:chevron-right" size="1rem" class="text-neutral-400" />
          </template>

          <template #mobile="{ item: c }">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center rounded-md bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-700">
                    {{ c.year }}
                  </span>
                </div>
                <div class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-neutral-500">
                  <span
                    >Min. cat.:
                    <span class="font-medium text-neutral-700"
                      >{{ formatNullable(c.minHoursPerCategory) }}h × {{ formatNullable(c.minCategoriesRequired) }}</span
                    ></span
                  >
                  <span
                    >Mult.: <span class="font-medium text-neutral-700">{{ c.excessToFreeMultiplier }}×</span></span
                  >
                  <span
                    >Livres: <span class="font-medium text-neutral-700">{{ c.minFreeHours }}h</span></span
                  >
                </div>
              </div>
              <Icon name="lucide:chevron-right" size="1.25rem" class="mt-0.5 shrink-0 text-neutral-400" />
            </div>
          </template>

          <template v-if="canCreate" #empty-action>
            <SGButton test-id="empty-state-add-button" variant="primary" icon="lucide:plus" size="sm" @click="createModal = true">
              Adicionar Currículo
            </SGButton>
          </template>
        </SGTable>
      </SGCard>

      <SGModal v-model:open="createModal" title="Novo Currículo" description="Configure as regras globais para um novo ano de currículo.">
        <config-curriculum-form :existing-years="existingYears" @created="handleCreated" />
      </SGModal>
    </div>
  </div>
</template>
