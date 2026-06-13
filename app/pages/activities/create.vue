<script setup lang="ts">
import type { ActivityTypeResponseDto } from "~/interfaces/ActivityTypeResponseDto";
import type { CreateActivityDto } from "~/interfaces/CreateActivityDto";

useHead({ title: "Nova Atividade — SWGAC" });

const router = useRouter();
const { user } = useAuthState();
const { createActivity, loading } = useActivities();
const { showToastSuccess, showToastError } = useToastNotification();

const listPath = computed(() => (user.value?.role === "member" ? "/activities/me" : "/activities"));

const UNIT_FIXED_CODS = ["I1", "I2", "I3", "K"];
const UNIT_EVENT_CODS = ["H1", "H2", "H3"];

const activityClass = ref("");
const activityTypeId = ref("");
const selectedType = ref<ActivityTypeResponseDto | null>(null);
const event = ref("");
const organization = ref("");
const hours = ref<number | undefined>();
const startDate = ref("");
const endDate = ref("");
const certificateUrl = ref("");
const fileName = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const classOptions = [
  { label: "Complementar", value: "COMPLEMENTAR" },
  { label: "Livre", value: "LIVRE" },
];

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
  if (value.length === 0) return true;
  return value.length <= 500;
});

const isValid = computed(() => {
  if (
    activityClass.value === "" ||
    activityTypeId.value.trim().length === 0 ||
    event.value.trim().length === 0 ||
    startDate.value === "" ||
    endDate.value === "" ||
    !isCertificateUrlValid.value
  ) {
    return false;
  }

  if (showHoursInput.value) {
    return hours.value !== undefined && hours.value > 0;
  }

  return true;
});

const curriculumError = ref<string | null>(null);

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    fileName.value = input.files[0]!.name;
  }
};

const handleFileRemove = () => {
  fileName.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const buildHoursPayload = (): number | undefined => {
  if (isFixedUnit.value) return 1;
  if (showHoursInput.value) return hours.value;
  return undefined;
};

const handleSubmit = async () => {
  if (!isValid.value || loading.value) return;

  const trimmedCertificate = certificateUrl.value.trim();
  const hoursPayload = buildHoursPayload();

  const payload: CreateActivityDto = {
    activityTypeId: activityTypeId.value.trim(),
    class: activityClass.value,
    event: event.value.trim(),
    organization: organization.value.trim() || undefined,
    startDate: startDate.value,
    endDate: endDate.value,
    ...(hoursPayload !== undefined ? { hours: hoursPayload } : {}),
    ...(trimmedCertificate ? { certificateUrl: trimmedCertificate } : {}),
  };

  curriculumError.value = null;
  try {
    await createActivity(payload);
    showToastSuccess("Atividade criada com sucesso");
    router.push(listPath.value);
  } catch (e: any) {
    const status = e?.statusCode ?? e?.response?.status ?? e?.status;
    const rawMessage = e?.data?.message ?? e?.response?._data?.message;
    const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
    if (status === 422 && message) {
      curriculumError.value = message;
      return;
    }
    showToastError(message ?? "Erro ao criar atividade");
  }
};
</script>

<template>
  <div class="mx-auto max-w-2xl py-6">
    <div class="mb-6">
      <button
        class="flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        data-testid="back-button"
        @click="router.back()"
      >
        <Icon name="lucide:arrow-left" size="1rem" />
        Voltar
      </button>
      <h1 class="mt-2 text-xl font-bold text-neutral-900 md:text-2xl">Nova Atividade</h1>
      <p class="mt-1 text-sm text-neutral-500">Preencha os dados para registrar uma nova atividade.</p>
    </div>

    <div
      v-if="curriculumError"
      class="mb-5 flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 px-4 py-3"
      data-testid="curriculum-error-banner"
      role="alert"
    >
      <Icon name="lucide:circle-alert" size="1.25rem" class="mt-0.5 shrink-0 text-error-600" />
      <div class="flex-1">
        <p class="text-sm font-semibold text-error-700">Não foi possível criar a atividade</p>
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

    <form data-testid="create-activity-form" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-6">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Evento <span class="text-error-500">*</span> </label>
            <SGInput v-model="event" placeholder="Ex: Monitoria de Algoritmos" test-id="input-event" />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Classe <span class="text-error-500">*</span> </label>
            <SGSelect v-model="activityClass" placeholder="Selecione a classe" :options="classOptions" test-id="select-class" />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Tipo de Atividade <span class="text-error-500">*</span> </label>
            <activities-activity-type-select
              v-model="activityTypeId"
              test-id="select-activity-type"
              @change="handleTypeChange"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Organização </label>
            <SGInput v-model="organization" placeholder="Ex: UFPel" test-id="input-organization" />
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
              test-id="input-hours"
              @update:model-value="hours = $event ? Number($event) : undefined"
            />
            <p
              v-else-if="isSemesterUnit"
              class="rounded-md border border-dashed border-default bg-elevated px-3 py-2 text-xs text-muted"
              data-testid="hours-info-semester"
            >
              Calculado automaticamente a partir das datas.
            </p>
            <p
              v-else-if="isFixedUnit"
              class="rounded-md border border-dashed border-default bg-elevated px-3 py-2 text-xs text-muted"
              data-testid="hours-info-fixed"
            >
              Valor único registrado automaticamente.
            </p>
            <p
              v-else
              class="rounded-md border border-dashed border-default bg-elevated px-3 py-2 text-xs text-dimmed"
              data-testid="hours-info-none"
            >
              Selecione o tipo de atividade para definir as horas.
            </p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Data Inicial <span class="text-error-500">*</span> </label>
            <SGDatePicker v-model="startDate" placeholder="Selecione uma data" test-id="input-start-date" />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Data Final <span class="text-error-500">*</span> </label>
            <SGDatePicker v-model="endDate" placeholder="Selecione uma data" test-id="input-end-date" />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">
              Link de validação do certificado <span class="text-xs text-neutral-400">(opcional)</span>
            </label>
            <SGInput
              v-model="certificateUrl"
              type="url"
              placeholder="https://..."
              test-id="input-certificate-url"
            />
            <p v-if="!isCertificateUrlValid" class="mt-1 text-xs text-error-500">
              O link deve ter no máximo 500 caracteres.
            </p>
          </div>
        </div>

        <USeparator />

        <div>
          <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Comprovante </label>
          <label
            class="group flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-accented p-5 transition-all duration-200 hover:border-primary hover:bg-primary/5"
            data-testid="file-upload"
          >
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
              <Icon name="lucide:upload-cloud" size="1.25rem" class="text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <p v-if="fileName" class="truncate text-sm font-medium text-neutral-900">
                {{ fileName }}
              </p>
              <p v-else class="text-sm text-neutral-600">Clique para enviar um arquivo</p>
              <p class="mt-0.5 text-xs text-neutral-400">PDF, PNG ou JPG até 5MB</p>
            </div>
            <button
              v-if="fileName"
              type="button"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500"
              data-testid="file-remove-button"
              aria-label="Remover arquivo"
              @click.stop.prevent="handleFileRemove"
            >
              <Icon name="lucide:x" size="1.125rem" />
            </button>
            <input ref="fileInput" type="file" class="hidden" accept=".pdf,.png,.jpg,.jpeg" @change="handleFileChange" />
          </label>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-end gap-3 border-t border-neutral-200 pt-6">
        <SGButton variant="secondary" test-id="cancel-button" type="button" @click="router.back()"> Cancelar </SGButton>
        <SGButton variant="primary" test-id="submit-button" type="submit" :loading="loading" :disabled="!isValid || loading"> Criar </SGButton>
      </div>
    </form>
  </div>
</template>
