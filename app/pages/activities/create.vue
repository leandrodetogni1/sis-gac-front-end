<script setup lang="ts">
import type { ActivityType, CreateActivityPayload } from "~/composables/useActivities";

useHead({ title: "Nova Atividade — SWGAC" });

const router = useRouter();
const { createActivity, loading } = useActivities();

const title = ref("");
const type = ref<ActivityType | "">("");
const hours = ref<number | undefined>();
const date = ref("");
const description = ref("");
const fileName = ref("");

const typeOptions = [
  { label: "Complementar", value: "complementar" },
  { label: "Livre", value: "livre" },
];

const isValid = computed(() => {
  return (
    title.value.trim().length > 0 &&
    type.value !== "" &&
    hours.value !== undefined &&
    hours.value > 0 &&
    date.value !== ""
  );
});

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    fileName.value = input.files[0].name;
  }
};

const handleSubmit = async () => {
  if (!isValid.value || loading.value) return;

  const payload: CreateActivityPayload = {
    title: title.value.trim(),
    type: type.value as ActivityType,
    hours: hours.value!,
    date: date.value,
    user: { name: "Usuário Atual" },
  };

  await createActivity(payload);
  router.push("/activities");
};
</script>

<template>
  <div class="mx-auto max-w-xl py-6">
    <div class="mb-6">
      <button
        class="flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        data-testid="back-button"
        @click="router.back()"
      >
        <Icon name="lucide:arrow-left" size="1rem" />
        Voltar
      </button>
      <h1 class="mt-2 text-xl font-bold text-neutral-900 md:text-2xl">
        Nova Atividade
      </h1>
      <p class="mt-1 text-sm text-neutral-500">
        Preencha os dados para registrar uma nova atividade.
      </p>
    </div>

    <SGCard test-id="create-activity-card">
      <form data-testid="create-activity-form" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-5">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">
              Título <span class="text-error-500">*</span>
            </label>
            <SGInput
              v-model="title"
              placeholder="Ex: Monitoria de Algoritmos"
              test-id="input-title"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">
              Tipo <span class="text-error-500">*</span>
            </label>
            <SGSelect
              v-model="type"
              placeholder="Selecione o tipo"
              :options="typeOptions"
              test-id="select-type"
            />
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-neutral-700">
                Horas <span class="text-error-500">*</span>
              </label>
              <SGInput
                :model-value="hours !== undefined ? String(hours) : ''"
                type="number"
                placeholder="Ex: 40"
                test-id="input-hours"
                @update:model-value="hours = $event ? Number($event) : undefined"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-neutral-700">
                Data <span class="text-error-500">*</span>
              </label>
              <SGDatePicker
                v-model="date"
                placeholder="Selecione uma data"
                test-id="input-date"
              />
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">
              Descrição
            </label>
            <SGTextarea
              v-model="description"
              placeholder="Descreva brevemente a atividade (opcional)"
              :rows="4"
              test-id="input-description"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-neutral-700">
              Comprovante
            </label>
            <label
              class="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-neutral-300 p-4 transition-colors hover:border-primary-400 hover:bg-primary-50"
              data-testid="file-upload"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                <Icon name="lucide:upload" size="1.25rem" class="text-neutral-500" />
              </div>
              <div class="flex-1">
                <p v-if="fileName" class="text-sm font-medium text-neutral-900">
                  {{ fileName }}
                </p>
                <p v-else class="text-sm text-neutral-500">
                  Clique para enviar um arquivo
                </p>
                <p class="text-xs text-neutral-400">PDF, PNG ou JPG até 5MB</p>
              </div>
              <input
                type="file"
                class="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                @change="handleFileChange"
              />
            </label>
          </div>
        </div>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <SGButton
            variant="secondary"
            test-id="cancel-button"
            type="button"
            @click="router.back()"
          >
            Cancelar
          </SGButton>
          <SGButton
            variant="primary"
            test-id="submit-button"
            type="submit"
            :loading="loading"
            :disabled="!isValid || loading"
          >
            Registrar Atividade
          </SGButton>
        </div>
      </form>
    </SGCard>
  </div>
</template>
