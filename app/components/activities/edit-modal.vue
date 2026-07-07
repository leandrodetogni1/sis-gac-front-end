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

const ACCEPTED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
const curriculumError = ref<string | null>(null);

const newFile = ref<File | null>(null);
const newFileName = ref("");
const fileError = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const existingFileCleared = ref(false);

const hasExistingFile = computed(() => Boolean(props.activity?.file));
const showExistingFile = computed(
  () => hasExistingFile.value && !existingFileCleared.value && !newFile.value,
);

const todayIso = todayISODate();

watch(startDate, (value) => {
  if (value && endDate.value && endDate.value < value) {
    endDate.value = "";
  }
});

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
  newFile.value = null;
  newFileName.value = "";
  fileError.value = null;
  existingFileCleared.value = false;
  if (fileInput.value) fileInput.value.value = "";
};

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  fileError.value = null;
  const selected = input.files?.[0];
  if (!selected) return;

  if (!ACCEPTED_FILE_TYPES.includes(selected.type)) {
    fileError.value = "Formato inválido. Envie um arquivo PDF, PNG ou JPEG.";
    input.value = "";
    return;
  }
  if (selected.size > MAX_FILE_SIZE) {
    fileError.value = "O arquivo excede o tamanho máximo de 5MB.";
    input.value = "";
    return;
  }

  newFile.value = selected;
  newFileName.value = selected.name;
};

const handleFileRemove = () => {
  newFile.value = null;
  newFileName.value = "";
  fileError.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

const handleExistingFileRemove = () => {
  existingFileCleared.value = true;
  fileError.value = null;
};

watch(
  () => [props.activity?.id, open.value] as const,
  ([, isOpen]) => {
    if (isOpen) {
      resetForm();
      curriculumError.value = null;
    }
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
  const hasNewFile = Boolean(newFile.value);
  const removeFile = !hasNewFile && hasExistingFile.value && existingFileCleared.value;

  if (Object.keys(payload).length === 0 && !hasNewFile && !removeFile) {
    open.value = false;
    return;
  }

  submitting.value = true;
  curriculumError.value = null;
  try {
    await updateActivity(props.activity.id, payload, { file: newFile.value, removeFile });
    showToastSuccess("Atividade atualizada com sucesso");
    open.value = false;
    emit("updated");
  } catch (e: any) {
    const status = e?.statusCode ?? e?.response?.status ?? e?.status;
    const rawMessage = e?.data?.message ?? e?.response?._data?.message;
    const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
    if (status === 422 && message) {
      curriculumError.value = message;
      return;
    }
    if (status === 413) {
      const sizeMessage = message ?? "O arquivo excede o tamanho máximo de 5MB.";
      fileError.value = sizeMessage;
      showToastError(sizeMessage);
      return;
    }
    showToastError(message ?? "Erro ao atualizar atividade");
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
      <div
        v-if="curriculumError"
        class="mb-4 flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 px-4 py-3"
        data-testid="edit-curriculum-error-banner"
        role="alert"
      >
        <Icon name="lucide:circle-alert" size="1.25rem" class="mt-0.5 shrink-0 text-error-600" />
        <div class="flex-1">
          <p class="text-sm font-semibold text-error-700">Não foi possível atualizar a atividade</p>
          <p class="mt-0.5 text-sm text-error-700">{{ curriculumError }}</p>
        </div>
        <button
          class="rounded-md p-1 text-error-500 transition-colors hover:bg-error-100 hover:text-error-700"
          aria-label="Fechar"
          @click="curriculumError = null"
        >
          <Icon name="lucide:x" size="1rem" />
        </button>
      </div>

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
          <SGDatePicker v-model="startDate" :max-date="todayIso" test-id="edit-input-start-date" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Data Final <span class="text-error-500">*</span> </label>
          <SGDatePicker
            v-model="endDate"
            :min-date="startDate || undefined"
            :max-date="todayIso"
            :disabled="!startDate"
            test-id="edit-input-end-date"
          />
          <p v-if="!startDate" class="mt-1 text-xs text-neutral-400">Selecione a data inicial primeiro.</p>
          <p v-else-if="!isDateRangeValid" class="mt-1 text-xs text-error-500">
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

        <div class="sm:col-span-2">
          <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Comprovante </label>

          <div
            v-if="showExistingFile"
            class="flex items-center gap-3 rounded-lg border border-default bg-elevated px-3 py-2.5"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon name="lucide:file-text" size="1.05rem" class="text-primary" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-neutral-900">{{ activity?.file?.filename }}</p>
              <p class="mt-0.5 text-xs text-neutral-500">{{ formatBytes(activity?.file?.size) }} · enviado</p>
            </div>
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500"
              data-testid="edit-existing-file-remove-button"
              aria-label="Remover arquivo"
              @click="handleExistingFileRemove"
            >
              <Icon name="lucide:x" size="1.125rem" />
            </button>
          </div>

          <label
            v-else
            class="group flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-accented p-4 transition-all duration-200 hover:border-primary hover:bg-primary/5"
            data-testid="edit-file-upload"
          >
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
              <Icon name="lucide:upload-cloud" size="1.25rem" class="text-primary" />
            </div>
            <div class="min-w-0 flex-1">
              <p v-if="newFileName" class="truncate text-sm font-medium text-neutral-900">{{ newFileName }}</p>
              <p v-else class="text-sm text-neutral-600">Clique para enviar um arquivo</p>
              <p class="mt-0.5 text-xs text-neutral-500">
                {{ newFile ? formatBytes(newFile.size) : "PDF, PNG ou JPG até 5MB" }}
              </p>
            </div>
            <button
              v-if="newFileName"
              type="button"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500 sm:h-9 sm:w-9"
              data-testid="edit-file-remove-button"
              aria-label="Remover arquivo"
              @click.stop.prevent="handleFileRemove"
            >
              <Icon name="lucide:x" size="1.125rem" />
            </button>
            <input ref="fileInput" type="file" class="hidden" accept="application/pdf,image/png,image/jpeg" @change="handleFileChange" />
          </label>
          <p v-if="fileError" class="mt-1.5 text-xs text-error-500" data-testid="edit-file-error">{{ fileError }}</p>
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
