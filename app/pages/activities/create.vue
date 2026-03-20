<script setup lang="ts">
import type { CreateActivityDto } from "~/interfaces/CreateActivityDto";

useHead({ title: "Nova Atividade — SWGAC" });

const router = useRouter();
const { createActivity, loading } = useActivities();

const activityClass = ref("");
const activityTypeId = ref("");
const event = ref("");
const organization = ref("");
const hours = ref<number | undefined>();
const startDate = ref("");
const endDate = ref("");
const fileName = ref("");

const classOptions = [
  { label: "Complementar", value: "COMPLEMENTAR" },
  { label: "Livre", value: "LIVRE" },
];

const isValid = computed(() => {
  return (
    activityClass.value !== "" &&
    activityTypeId.value.trim().length > 0 &&
    event.value.trim().length > 0 &&
    hours.value !== undefined &&
    hours.value > 0 &&
    startDate.value !== "" &&
    endDate.value !== ""
  );
});

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    fileName.value = input.files[0]!.name;
  }
};

const handleSubmit = async () => {
  if (!isValid.value || loading.value) return;

  const payload: CreateActivityDto = {
    authorId: "12345678",
    activityTypeId: activityTypeId.value.trim(),
    class: activityClass.value,
    event: event.value.trim(),
    organization: organization.value.trim() || undefined,
    hours: hours.value!,
    startDate: startDate.value,
    endDate: endDate.value,
  };

  try {
    await createActivity(payload);
    router.push("/activities");
  } catch {
    // error is handled by composable
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

    <form data-testid="create-activity-form" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-6">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Evento <span class="text-error-500">*</span> </label>
            <SGInput v-model="event" placeholder="Ex: Monitoria de Algoritmos" test-id="input-event" />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Classe <span class="text-error-500">*</span> </label>
            <SGSelect v-model="activityClass" placeholder="Selecione a classe" :options="classOptions" test-id="select-class" />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Tipo de Atividade <span class="text-error-500">*</span> </label>
            <activities-activity-type-select v-model="activityTypeId" test-id="select-activity-type" />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Organização </label>
            <SGInput v-model="organization" placeholder="Ex: UFPel" test-id="input-organization" />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Horas <span class="text-error-500">*</span> </label>
            <SGInput
              :model-value="hours !== undefined ? String(hours) : ''"
              type="number"
              placeholder="Ex: 40"
              test-id="input-hours"
              @update:model-value="hours = $event ? Number($event) : undefined"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Data Inicial <span class="text-error-500">*</span> </label>
            <SGDatePicker v-model="startDate" placeholder="Selecione uma data" test-id="input-start-date" />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Data Final <span class="text-error-500">*</span> </label>
            <SGDatePicker v-model="endDate" placeholder="Selecione uma data" test-id="input-end-date" />
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
            <input type="file" class="hidden" accept=".pdf,.png,.jpg,.jpeg" @change="handleFileChange" />
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
