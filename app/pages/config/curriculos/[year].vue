<script setup lang="ts">
import { Course, CourseLabels } from "~/enums/Course";
import { CurriculumYear, CurriculumYearLabels } from "~/enums/CurriculumYear";
import type { ActivityTypeResponseDto } from "~/interfaces/ActivityTypeResponseDto";

useHead({ title: "Currículo — Configurações — SWGAC" });

const route = useRoute();
const router = useRouter();
const { user } = useAuthState();
const {
  curriculum,
  loading,
  error,
  getCurriculum,
  updateCurriculum,
  deleteCurriculum,
  upsertCourseRule,
  upsertActivityTypeRule,
} = useCurricula();
const { activityTypes, getActivityTypes } = useActivityTypes();
const { showToastSuccess, showToastError } = useToastNotification();
const { confirmAlert } = useAlerts();

const ready = ref(false);

const yearParam = computed(() => route.params.year as string);
const canEdit = computed(() => user.value?.role === "owner");

const minHoursPerCategory = ref<string | number>("");
const minCategoriesRequired = ref<string>("");
const excessToFreeMultiplier = ref<string | number>("");
const minFreeHours = ref<string | number>("");

const courseRulesState = ref<Record<string, { totalMin: string | number; totalMax: string | number }>>({});
const activityTypeRulesState = ref<Record<string, { maxHoursTotal: string | number; maxHoursPerCertificateOrSemester: string | number }>>({});

const editingGlobal = ref(false);
const editingCourse = ref<string | null>(null);
const editingActivityType = ref<string | null>(null);

const anyEditing = computed(
  () => editingGlobal.value || editingCourse.value !== null || editingActivityType.value !== null,
);

const globalModalOpen = computed({
  get: () => editingGlobal.value,
  set: (val: boolean) => {
    if (!val) cancelEditGlobal();
  },
});

const courseModalOpen = computed({
  get: () => editingCourse.value !== null,
  set: (val: boolean) => {
    if (!val) cancelEditCourse();
  },
});

const activityTypeModalOpen = computed({
  get: () => editingActivityType.value !== null,
  set: (val: boolean) => {
    if (!val) cancelEditActivityType();
  },
});

const editingActivityTypeData = computed(() => {
  if (!editingActivityType.value) return null;
  return activityTypes.value.find((t) => t.cod === editingActivityType.value) ?? null;
});

const courseModalTitle = computed(() => {
  const c = editingCourse.value;
  if (!c) return "";
  const label = CourseLabels[c as Course] ?? c;
  return hasCourseRule(c as Course) ? `Editar regra · ${label}` : `Configurar regra · ${label}`;
});

const activityTypeModalTitle = computed(() => {
  const cod = editingActivityType.value;
  if (!cod) return "";
  const label = editingActivityTypeData.value?.label ?? cod;
  return hasActivityTypeRule(cod) ? `Editar regra · ${label}` : `Configurar regra · ${label}`;
});

const minCategoriesOptions = [
  { value: "2", label: "2 categorias" },
  { value: "3", label: "3 categorias" },
];

const isBlank = (v: unknown): boolean => v === null || v === undefined || v === "";

const requireMinCategories = computed(() => !isBlank(minHoursPerCategory.value));

const categoryLabels: Record<string, string> = {
  ENSINO: "Ensino",
  PESQUISA: "Pesquisa",
  EXTENSAO: "Extensão",
};

const groupedActivityTypes = computed(() => {
  const groups: Record<string, ActivityTypeResponseDto[]> = {};
  for (const type of activityTypes.value) {
    const cat = type.category ?? "OUTROS";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(type);
  }
  return groups;
});

const groupKeys = computed(() => Object.keys(groupedActivityTypes.value).sort());

const hasCourseRule = (course: Course): boolean => {
  return curriculum.value?.courseRules.some((r) => r.course === course) ?? false;
};

const hasActivityTypeRule = (cod: string): boolean => {
  return curriculum.value?.activityTypeRules.some((r) => r.cod === cod) ?? false;
};

const hydrateForm = () => {
  if (!curriculum.value) return;
  const c = curriculum.value;
  minHoursPerCategory.value = c.minHoursPerCategory !== null ? String(c.minHoursPerCategory) : "";
  minCategoriesRequired.value = c.minCategoriesRequired !== null ? String(c.minCategoriesRequired) : "";
  excessToFreeMultiplier.value = String(c.excessToFreeMultiplier);
  minFreeHours.value = String(c.minFreeHours);

  const cr: Record<string, { totalMin: string; totalMax: string }> = {};
  for (const course of Object.values(Course)) {
    const existing = c.courseRules.find((r) => r.course === course);
    cr[course] = {
      totalMin: existing ? String(existing.totalMin) : "",
      totalMax: existing ? String(existing.totalMax) : "",
    };
  }
  courseRulesState.value = cr;

  const atr: Record<string, { maxHoursTotal: string; maxHoursPerCertificateOrSemester: string }> = {};
  for (const type of activityTypes.value) {
    const existing = c.activityTypeRules.find((r) => r.cod === type.cod);
    atr[type.cod] = {
      maxHoursTotal: existing ? String(existing.maxHoursTotal) : "",
      maxHoursPerCertificateOrSemester: existing ? String(existing.maxHoursPerCertificateOrSemester) : "",
    };
  }
  activityTypeRulesState.value = atr;
};

const loadAll = async () => {
  await Promise.all([getCurriculum(yearParam.value), getActivityTypes()]);
  hydrateForm();
  ready.value = true;
};

const isGlobalFormValid = computed(() => {
  if (isBlank(excessToFreeMultiplier.value) || Number(excessToFreeMultiplier.value) < 0) return false;
  if (isBlank(minFreeHours.value) || Number(minFreeHours.value) < 0) return false;
  if (requireMinCategories.value && !minCategoriesRequired.value) return false;
  return true;
});

const startEditGlobal = () => {
  if (anyEditing.value) return;
  editingGlobal.value = true;
};

const cancelEditGlobal = () => {
  hydrateForm();
  editingGlobal.value = false;
};

const handleSaveGlobal = async () => {
  if (!canEdit.value || !isGlobalFormValid.value || loading.value) return;
  try {
    await updateCurriculum(yearParam.value, {
      minHoursPerCategory: !isBlank(minHoursPerCategory.value) ? Number(minHoursPerCategory.value) : undefined,
      minCategoriesRequired: minCategoriesRequired.value ? Number(minCategoriesRequired.value) : undefined,
      excessToFreeMultiplier: Number(excessToFreeMultiplier.value),
      minFreeHours: Number(minFreeHours.value),
    });
    hydrateForm();
    editingGlobal.value = false;
    showToastSuccess("Mudanças só afetam novas atividades.");
  } catch (e: any) {
    const message = e?.data?.message ?? "Erro ao salvar regras globais";
    showToastError(Array.isArray(message) ? message.join(", ") : message);
  }
};

const isCourseRuleValid = (course: Course): boolean => {
  const r = courseRulesState.value[course];
  if (!r) return false;
  if (isBlank(r.totalMin) || isBlank(r.totalMax)) return false;
  const min = Number(r.totalMin);
  const max = Number(r.totalMax);
  return min >= 0 && max >= 0 && min <= max;
};

const startEditCourse = (course: Course) => {
  if (anyEditing.value) return;
  editingCourse.value = course;
};

const cancelEditCourse = () => {
  hydrateForm();
  editingCourse.value = null;
};

const handleSaveCourseRule = async (course: Course) => {
  if (!canEdit.value || !isCourseRuleValid(course) || loading.value) return;
  const r = courseRulesState.value[course]!;
  try {
    await upsertCourseRule(yearParam.value, course, {
      totalMin: Number(r.totalMin),
      totalMax: Number(r.totalMax),
    });
    hydrateForm();
    editingCourse.value = null;
    showToastSuccess("Mudanças só afetam novas atividades.");
  } catch (e: any) {
    const message = e?.data?.message ?? "Erro ao salvar regra de curso";
    showToastError(Array.isArray(message) ? message.join(", ") : message);
  }
};

const isActivityTypeRuleValid = (cod: string): boolean => {
  const r = activityTypeRulesState.value[cod];
  if (!r) return false;
  if (isBlank(r.maxHoursTotal) || isBlank(r.maxHoursPerCertificateOrSemester)) return false;
  const total = Number(r.maxHoursTotal);
  const each = Number(r.maxHoursPerCertificateOrSemester);
  return total >= 0 && each >= 0 && each <= total;
};

const startEditActivityType = (cod: string) => {
  if (anyEditing.value) return;
  editingActivityType.value = cod;
};

const cancelEditActivityType = () => {
  hydrateForm();
  editingActivityType.value = null;
};

const handleSaveActivityTypeRule = async (cod: string) => {
  if (!canEdit.value || !isActivityTypeRuleValid(cod) || loading.value) return;
  const r = activityTypeRulesState.value[cod]!;
  try {
    await upsertActivityTypeRule(yearParam.value, cod, {
      maxHoursTotal: Number(r.maxHoursTotal),
      maxHoursPerCertificateOrSemester: Number(r.maxHoursPerCertificateOrSemester),
    });
    hydrateForm();
    editingActivityType.value = null;
    showToastSuccess("Mudanças só afetam novas atividades.");
  } catch (e: any) {
    const message = e?.data?.message ?? "Erro ao salvar regra do tipo";
    showToastError(Array.isArray(message) ? message.join(", ") : message);
  }
};

const handleDeleteCurriculum = async () => {
  if (!canEdit.value || loading.value || anyEditing.value) return;
  const yearLabel = CurriculumYearLabels[yearParam.value as CurriculumYear] ?? yearParam.value;
  const confirmed = await confirmAlert(
    `O currículo "${yearLabel}" será removido permanentemente, incluindo todas as regras configuradas. Essa ação não pode ser desfeita.`,
    "Remover currículo?",
    "warning",
  );
  if (!confirmed) return;
  try {
    await deleteCurriculum(yearParam.value);
    showToastSuccess("Currículo removido com sucesso");
    router.push("/config/curriculos");
  } catch (e: any) {
    const message = e?.data?.message ?? "Erro ao remover currículo";
    showToastError(Array.isArray(message) ? message.join(", ") : message);
  }
};

onMounted(async () => {
  await loadAll();
});
</script>

<template>
  <div>
    <div v-if="!ready" class="flex min-h-[40vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando currículo...</p>
      </div>
    </div>

    <div v-else-if="error && !curriculum" class="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <Icon name="lucide:circle-x" size="2rem" class="text-error-500" />
      <p class="text-sm text-neutral-700">{{ error }}</p>
      <SGButton variant="secondary" size="sm" @click="router.push('/config/curriculos')">Voltar</SGButton>
    </div>

    <div v-else-if="curriculum" class="space-y-5">
      <div>
        <button
          class="flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
          data-testid="back-button"
          @click="router.push('/config/curriculos')"
        >
          <Icon name="lucide:arrow-left" size="1rem" />
          Currículos
        </button>
        <div class="mt-2 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center rounded-md bg-primary-50 px-2.5 py-1 text-sm font-bold text-primary-700">
              {{ CurriculumYearLabels[curriculum.year] ?? curriculum.year }}
            </span>
            <h1 class="text-xl font-bold text-neutral-900 md:text-2xl">Currículo</h1>
          </div>
          <button
            v-if="canEdit"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-error-200 bg-white px-3 py-1.5 text-xs font-medium text-error-600 transition-colors hover:border-error-300 hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="delete-curriculum-button"
            :disabled="loading || anyEditing"
            title="Remove o currículo inteiro e todas as suas regras"
            @click="handleDeleteCurriculum"
          >
            <Icon name="lucide:trash-2" size="0.875rem" />
            Remover currículo
          </button>
        </div>
        <p v-if="!canEdit" class="mt-2 text-xs text-neutral-500">
          Modo somente leitura — apenas o proprietário pode editar.
        </p>
      </div>

      <SGCard test-id="card-global-rules">
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-neutral-900">Regras globais</h2>
            <p class="mt-0.5 text-xs text-neutral-500">Limites aplicados a todos os cursos.</p>
          </div>

          <button
            v-if="canEdit"
            class="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="edit-global-button"
            :disabled="anyEditing"
            @click="startEditGlobal"
          >
            <Icon name="lucide:pencil" size="0.875rem" />
            Editar
          </button>
        </div>

        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <div>
            <dt class="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Min. horas / categoria
            </dt>
            <dd class="mt-1 text-base font-semibold tabular-nums text-neutral-900">
              {{ minHoursPerCategory || "—" }}
            </dd>
          </div>

          <div>
            <dt class="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Min. categorias
            </dt>
            <dd class="mt-1 text-base font-semibold tabular-nums text-neutral-900">
              {{ minCategoriesRequired || "—" }}
            </dd>
          </div>

          <div>
            <dt class="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Mult. excedente
            </dt>
            <dd class="mt-1 text-base font-semibold tabular-nums text-neutral-900">
              {{ excessToFreeMultiplier }}<span class="text-neutral-400">×</span>
            </dd>
          </div>

          <div>
            <dt class="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Min. horas livres
            </dt>
            <dd class="mt-1 text-base font-semibold tabular-nums text-neutral-900">
              {{ minFreeHours }}<span class="text-neutral-400">h</span>
            </dd>
          </div>
        </dl>
      </SGCard>

      <SGCard test-id="card-course-rules">
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-neutral-900">Regras por curso</h2>
            <p class="mt-0.5 text-xs text-neutral-500">Total mínimo e máximo de horas por curso.</p>
          </div>
        </div>

        <div class="divide-y divide-neutral-100">
          <div
            v-for="course in Object.values(Course)"
            :key="course"
            class="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-3 first:pt-0 last:pb-0"
            :data-testid="`course-row-${course}`"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-neutral-900">
                {{ CourseLabels[course] }}
              </p>
              <p v-if="!hasCourseRule(course)" class="mt-0.5 text-xs text-neutral-400">
                Não configurado
              </p>
            </div>

            <div class="w-44 shrink-0">
              <div v-if="hasCourseRule(course)" class="text-right text-sm tabular-nums">
                <span class="font-semibold text-neutral-900">{{ courseRulesState[course]?.totalMin }}</span>
                <span class="mx-1 text-neutral-300">/</span>
                <span class="font-semibold text-neutral-900">{{ courseRulesState[course]?.totalMax }}</span>
                <span class="ml-0.5 text-neutral-400">h</span>
              </div>
              <div v-else class="text-right text-sm text-neutral-300">—</div>
            </div>

            <div v-if="canEdit" class="flex shrink-0 items-center gap-1">
              <button
                class="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-primary-50 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                :data-testid="`edit-course-${course}`"
                :disabled="anyEditing"
                :title="hasCourseRule(course) ? 'Editar' : 'Configurar'"
                :aria-label="hasCourseRule(course) ? 'Editar' : 'Configurar'"
                @click="startEditCourse(course)"
              >
                <Icon :name="hasCourseRule(course) ? 'lucide:pencil' : 'lucide:plus'" size="1rem" />
              </button>
            </div>
          </div>
        </div>
      </SGCard>

      <SGCard test-id="card-activity-type-rules">
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-neutral-900">Regras por tipo de atividade</h2>
            <p class="mt-0.5 text-xs text-neutral-500">Tetos de horas por tipo, agrupados por categoria.</p>
          </div>
        </div>

        <div v-if="activityTypes.length === 0" class="rounded-lg border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
          Nenhum tipo de atividade cadastrado.
        </div>

        <div v-else class="space-y-5">
          <section v-for="cat in groupKeys" :key="cat">
            <div class="mb-1 flex items-center gap-3">
              <h3 class="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                {{ categoryLabels[cat] ?? cat }}
              </h3>
              <div class="h-px flex-1 bg-neutral-200" />
            </div>

            <div class="divide-y divide-neutral-100">
              <div
                v-for="type in groupedActivityTypes[cat]"
                :key="type.cod"
                class="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-2.5"
                :data-testid="`activity-type-row-${type.cod}`"
              >
                <div class="flex min-w-0 items-center gap-2.5">
                  <span class="inline-flex h-6 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50 text-[11px] font-bold text-primary-700">
                    {{ type.cod }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-neutral-900">{{ type.label }}</p>
                    <p v-if="!hasActivityTypeRule(type.cod)" class="mt-0.5 text-xs text-neutral-400">
                      Não configurado
                    </p>
                  </div>
                </div>

                <div class="w-44 shrink-0">
                  <div v-if="hasActivityTypeRule(type.cod)" class="text-right text-sm tabular-nums">
                    <span class="font-semibold text-neutral-900">{{ activityTypeRulesState[type.cod]?.maxHoursTotal }}</span>
                    <span class="ml-0.5 text-neutral-400">h</span>
                    <span class="mx-1 text-neutral-300">·</span>
                    <span class="font-semibold text-neutral-900">{{ activityTypeRulesState[type.cod]?.maxHoursPerCertificateOrSemester }}</span>
                    <span class="ml-0.5 text-neutral-400">/un</span>
                  </div>
                  <div v-else class="text-right text-sm text-neutral-300">—</div>
                </div>

                <div v-if="canEdit" class="flex shrink-0 items-center gap-1">
                  <button
                    class="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-primary-50 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                    :data-testid="`edit-activity-type-${type.cod}`"
                    :disabled="anyEditing"
                    :title="hasActivityTypeRule(type.cod) ? 'Editar' : 'Configurar'"
                    :aria-label="hasActivityTypeRule(type.cod) ? 'Editar' : 'Configurar'"
                    @click="startEditActivityType(type.cod)"
                  >
                    <Icon :name="hasActivityTypeRule(type.cod) ? 'lucide:pencil' : 'lucide:plus'" size="1rem" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </SGCard>

      <SGModal
        v-model:open="globalModalOpen"
        title="Editar regras globais"
        description="Limites aplicados a todos os cursos deste currículo."
        test-id="global-edit-modal"
      >
        <template #body>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-neutral-700">Min. horas por categoria</label>
              <SGInput
                v-model="minHoursPerCategory"
                type="number"
                placeholder="Ex: 120"
                test-id="modal-input-min-hours-per-category"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-neutral-700">
                Min. categorias
                <span v-if="requireMinCategories" class="text-error-500">*</span>
              </label>
              <SGSelect
                v-model="minCategoriesRequired"
                :options="minCategoriesOptions"
                placeholder="Selecione"
                test-id="modal-select-min-categories"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-neutral-700">
                Mult. excedente <span class="text-error-500">*</span>
              </label>
              <SGInput
                v-model="excessToFreeMultiplier"
                type="number"
                step="0.1"
                placeholder="Ex: 1"
                test-id="modal-input-multiplier"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-neutral-700">
                Min. horas livres <span class="text-error-500">*</span>
              </label>
              <SGInput
                v-model="minFreeHours"
                type="number"
                placeholder="Ex: 217"
                test-id="modal-input-min-free-hours"
              />
            </div>
          </div>
        </template>
        <template #footer="{ close }">
          <div class="flex w-full justify-end gap-2">
            <SGButton variant="secondary" test-id="modal-cancel-global" @click="close">
              Cancelar
            </SGButton>
            <SGButton
              variant="primary"
              icon="lucide:save"
              test-id="modal-save-global"
              :loading="loading"
              :disabled="!isGlobalFormValid || loading"
              @click="handleSaveGlobal"
            >
              Salvar
            </SGButton>
          </div>
        </template>
      </SGModal>

      <SGModal
        v-model:open="courseModalOpen"
        :title="courseModalTitle"
        description="Total mínimo e máximo de horas para este curso."
        test-id="course-edit-modal"
      >
        <template #body>
          <div v-if="editingCourse" class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-neutral-700">
                Total mínimo <span class="text-error-500">*</span>
              </label>
              <SGInput
                v-model="courseRulesState[editingCourse].totalMin"
                type="number"
                placeholder="0"
                test-id="modal-input-total-min"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-neutral-700">
                Total máximo <span class="text-error-500">*</span>
              </label>
              <SGInput
                v-model="courseRulesState[editingCourse].totalMax"
                type="number"
                placeholder="0"
                test-id="modal-input-total-max"
              />
            </div>
          </div>
        </template>
        <template #footer="{ close }">
          <div class="flex w-full justify-end gap-2">
            <SGButton variant="secondary" test-id="modal-cancel-course" @click="close">
              Cancelar
            </SGButton>
            <SGButton
              v-if="editingCourse"
              variant="primary"
              icon="lucide:save"
              test-id="modal-save-course"
              :loading="loading"
              :disabled="!isCourseRuleValid(editingCourse as Course) || loading"
              @click="handleSaveCourseRule(editingCourse as Course)"
            >
              Salvar
            </SGButton>
          </div>
        </template>
      </SGModal>

      <SGModal
        v-model:open="activityTypeModalOpen"
        :title="activityTypeModalTitle"
        description="Tetos de horas para este tipo de atividade."
        test-id="activity-type-edit-modal"
      >
        <template #body>
          <div v-if="editingActivityType && editingActivityTypeData">
            <div class="mb-4 flex items-center gap-2.5">
              <span class="inline-flex h-7 min-w-8 items-center justify-center rounded-md bg-primary-50 px-1.5 text-xs font-bold text-primary-700">
                {{ editingActivityTypeData.cod }}
              </span>
              <p class="text-sm text-neutral-600">
                Categoria: <span class="font-medium text-neutral-900">{{ categoryLabels[editingActivityTypeData.category ?? ""] ?? editingActivityTypeData.category ?? "—" }}</span>
              </p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-neutral-700">
                  Max total <span class="text-error-500">*</span>
                </label>
                <SGInput
                  v-model="activityTypeRulesState[editingActivityType].maxHoursTotal"
                  type="number"
                  placeholder="0"
                  test-id="modal-input-max-total"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-neutral-700">
                  Max por unidade <span class="text-error-500">*</span>
                </label>
                <SGInput
                  v-model="activityTypeRulesState[editingActivityType].maxHoursPerCertificateOrSemester"
                  type="number"
                  placeholder="0"
                  test-id="modal-input-max-each"
                />
              </div>
            </div>
          </div>
        </template>
        <template #footer="{ close }">
          <div class="flex w-full justify-end gap-2">
            <SGButton variant="secondary" test-id="modal-cancel-activity-type" @click="close">
              Cancelar
            </SGButton>
            <SGButton
              v-if="editingActivityType"
              variant="primary"
              icon="lucide:save"
              test-id="modal-save-activity-type"
              :loading="loading"
              :disabled="!isActivityTypeRuleValid(editingActivityType) || loading"
              @click="handleSaveActivityTypeRule(editingActivityType)"
            >
              Salvar
            </SGButton>
          </div>
        </template>
      </SGModal>
    </div>
  </div>
</template>
