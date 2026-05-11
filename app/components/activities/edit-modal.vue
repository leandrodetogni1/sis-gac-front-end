<script setup lang="ts">
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";
import type { ActivityTypeResponseDto } from "~/interfaces/ActivityTypeResponseDto";
import type { UpdateActivityDto } from "~/interfaces/UpdateActivityDto";

const props = defineProps<{
  activity: ActivityResponseDto | null;
}>();

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits(["updated"]);

const { updateActivity } = useActivities();
const { showToastSuccess, showToastError } = useToastNotification();

const UNIT_FIXED_CODS = ["I1", "I2", "I3", "K"];
const UNIT_EVENT_CODS = ["H1", "H2", "H3"];

const classOptions = [
  { label: "Complementar", value: "COMPLEMENTAR" },
  { label: "Livre", value: "LIVRE" },
];

const activityClass = ref("");
const activityTypeId = ref("");
const selectedType = ref<ActivityTypeResponseDto | null>(null);
const event = ref("");
const organization = ref("");
const hours = ref<number | undefined>();
const startDate = ref("");
const endDate = ref("");
const certificateUrl = ref("");
const submitting = ref(false);

const toIsoDate = (value: string | null): string => {
  if (!value) return "";
  return value.slice(0, 10);
};

const resetForm = () => {
  const a = props.activity;
  activityClass.value = a?.class ?? "";
  activityTypeId.value = a?.activityTypeId ?? "";
  selectedType.value = null;
  event.value = a?.event ?? "";
  organization.value = a?.organization ?? "";
  hours.value = a?.hours ?? undefined;
  startDate.value = toIsoDate(a?.startDate ?? null);
  endDate.value = toIsoDate(a?.endDate ?? null);
  certificateUrl.value = a?.certificateUrl ?? "";
};

watch(
  () => [props.activity?.id, open.value] as const,
  ([, isOpen]) => {
    if (isOpen) resetForm();
  },
  { immediate: true },
);

const unity = computed(() => selectedType.value?.unity ?? null);
const cod = computed(() => selectedType.value?.cod ?? null);

const isSemesterUnit = computed(() => unity.value === "SEMESTRE");
const isHoursUnit = computed(() => unity.value === "HORAS");
const isFixedUnit = computed(
  () => unity.value === "UNIDADE" && cod.value !== null && UNIT_FIXED_CODS.includes(cod.value),
);
const isEventHoursUnit = computed(
  () => unity.value === "UNIDADE" && cod.value !== null && UNIT_EVENT_CODS.includes(cod.value),
);

const showHoursInput = computed(() => isHoursUnit.value || isEventHoursUnit.value);

const hoursLabel = computed(() => {
  if (isHoursUnit.value) return "Horas do certificado";
  if (isEventHoursUnit.value) return "Horas do evento";
  return "Horas";
});

const handleTypeChange = (type: ActivityTypeResponseDto | null) => {
  selectedType.value = type;
  if (!showHoursInput.value) {
    hours.value = undefined;
  }
};

const isCertificateUrlValid = computed(() => {
  const value = certificateUrl.value.trim();
  return value.length <= 500;
});

const isDateRangeValid = computed(() => {
  if (!startDate.value || !endDate.value) return true;
  return endDate.value >= startDate.value;
});

const isValid = computed(() => {
  if (
    activityClass.value === "" ||
    activityTypeId.value.trim().length === 0 ||
    event.value.trim().length === 0 ||
    startDate.value === "" ||
    endDate.value === "" ||
    !isCertificateUrlValid.value ||
    !isDateRangeValid.value
  ) {
    return false;
  }

  if (showHoursInput.value) {
    return hours.value !== undefined && hours.value > 0;
  }

  return true;
});

const buildHoursPayload = (): number | undefined => {
  if (isFixedUnit.value) return 1;
  if (showHoursInput.value) return hours.value;
  return undefined;
};

const buildDiff = (): UpdateActivityDto => {
  const a = props.activity;
  if (!a) return {};

  const diff: UpdateActivityDto = {};
  const trimmedEvent = event.value.trim();
  const trimmedOrganization = organization.value.trim();
  const trimmedCertificate = certificateUrl.value.trim();
  const hoursPayload = buildHoursPayload();

  if (trimmedEvent !== (a.event ?? "")) diff.event = trimmedEvent;
  if (activityClass.value !== (a.class ?? "")) diff.class = activityClass.value as UpdateActivityDto["class"];
  if (activityTypeId.value !== (a.activityTypeId ?? "")) diff.activityTypeId = activityTypeId.value;
  if (trimmedOrganization !== (a.organization ?? "")) diff.organization = trimmedOrganization;
  if (trimmedCertificate !== (a.certificateUrl ?? "")) diff.certificateUrl = trimmedCertificate;
  if (startDate.value !== toIsoDate(a.startDate)) diff.startDate = startDate.value;
  if (endDate.value !== toIsoDate(a.endDate)) diff.endDate = endDate.value;
  if (hoursPayload !== undefined && hoursPayload !== (a.hours ?? undefined)) diff.hours = hoursPayload;

  return diff;
};

const handleSubmit = async () => {
  if (!props.activity || !isValid.value || submitting.value) return;

  const payload = buildDiff();

  if (Object.keys(payload).length === 0) {
    open.value = false;
    return;
  }

  submitting.value = true;
  try {
    await updateActivity(props.activity.id, payload);
    showToastSuccess("Atividade atualizada com sucesso");
    open.value = false;
    emit("updated");
  } catch (e: any) {
    const message = e?.data?.message ?? "Erro ao atualizar atividade";
    showToastError(message);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <SGModal
    v-model:open="open"
    title="Editar Atividade"
    description="Altere os dados antes da revisão"
    test-id="activity-edit-modal"
  >
    <template #body>
      <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="edit-activity-form" @submit.prevent="handleSubmit">
        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Evento <span class="text-error-500">*</span> </label>
          <SGInput v-model="event" placeholder="Ex: Monitoria de Algoritmos" test-id="edit-input-event" />
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Classe <span class="text-error-500">*</span> </label>
          <SGSelect v-model="activityClass" placeholder="Selecione a classe" :options="classOptions" test-id="edit-select-class" />
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Tipo de Atividade <span class="text-error-500">*</span> </label>
          <activities-activity-type-select
            v-model="activityTypeId"
            test-id="edit-select-activity-type"
            @change="handleTypeChange"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Organização </label>
          <SGInput v-model="organization" placeholder="Ex: UFPel" test-id="edit-input-organization" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-neutral-700">
            {{ hoursLabel }} <span v-if="showHoursInput" class="text-error-500">*</span>
          </label>
          <SGInput
            v-if="showHoursInput"
            :model-value="hours !== undefined ? String(hours) : ''"
            type="number"
            placeholder="Ex: 40"
            test-id="edit-input-hours"
            @update:model-value="hours = $event ? Number($event) : undefined"
          />
          <p
            v-else-if="isSemesterUnit"
            class="rounded-md border border-dashed border-default bg-elevated px-3 py-2 text-xs text-muted"
          >
            Calculado automaticamente a partir das datas.
          </p>
          <p
            v-else-if="isFixedUnit"
            class="rounded-md border border-dashed border-default bg-elevated px-3 py-2 text-xs text-muted"
          >
            Valor único registrado automaticamente.
          </p>
          <p
            v-else
            class="rounded-md border border-dashed border-default bg-elevated px-3 py-2 text-xs text-dimmed"
          >
            Selecione o tipo de atividade para definir as horas.
          </p>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Data Inicial <span class="text-error-500">*</span> </label>
          <SGDatePicker v-model="startDate" placeholder="Selecione uma data" test-id="edit-input-start-date" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Data Final <span class="text-error-500">*</span> </label>
          <SGDatePicker v-model="endDate" placeholder="Selecione uma data" test-id="edit-input-end-date" />
          <p v-if="!isDateRangeValid" class="mt-1 text-xs text-error-500">
            A data final deve ser maior ou igual à data inicial.
          </p>
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-neutral-700">
            Link de validação do certificado <span class="text-xs text-neutral-400">(opcional)</span>
          </label>
          <SGInput
            v-model="certificateUrl"
            type="url"
            placeholder="https://..."
            test-id="edit-input-certificate-url"
          />
          <p v-if="!isCertificateUrlValid" class="mt-1 text-xs text-error-500">
            O link deve ter no máximo 500 caracteres.
          </p>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <SGButton
          variant="secondary"
          test-id="edit-cancel-button"
          :disabled="submitting"
          @click="open = false"
        >
          Cancelar
        </SGButton>
        <SGButton
          variant="primary"
          test-id="edit-submit-button"
          :loading="submitting"
          :disabled="!isValid || submitting"
          @click="handleSubmit"
        >
          Salvar
        </SGButton>
      </div>
    </template>
  </SGModal>
</template>
