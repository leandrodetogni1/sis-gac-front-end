<script setup lang="ts">
import type { CreateInvitationDto } from "~/interfaces/CreateInvitationDto";
import type { InvitableRole } from "~/types/InvitableRole";

const emit = defineEmits(["created", "duplicate"]);

const { createInvitation, loading } = useInvitations();
const { showToastError } = useToastNotification();

const email = ref("");
const role = ref<InvitableRole | undefined>();

const roleOptions: { label: string; value: InvitableRole }[] = [
  { label: "Admin", value: "admin" },
  { label: "Reviewer", value: "reviewer" },
];

const emailIsValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));

const isValid = computed(() => emailIsValid.value && Boolean(role.value));

const handleSubmit = async () => {
  if (!isValid.value || loading.value) return;

  const payload: CreateInvitationDto = {
    email: email.value.trim(),
    role: role.value as InvitableRole,
  };

  try {
    await createInvitation(payload);
    email.value = "";
    role.value = undefined;
    emit("created");
  } catch (e: any) {
    const status = e?.statusCode ?? e?.status;
    if (status === 409) {
      showToastError("Já existe usuário/convite com esse email");
      emit("duplicate");
    } else {
      showToastError(e?.data?.message ?? "Erro ao criar convite");
    }
  }
};
</script>

<template>
  <form data-testid="invitation-form" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">
          Email <span class="text-error-500">*</span>
        </label>
        <SGInput
          v-model="email"
          type="email"
          placeholder="usuario@email.com"
          test-id="input-invitation-email"
          icon="lucide:mail"
        />
        <p v-if="email.length > 0 && !emailIsValid" class="mt-1 text-xs text-error-500">
          Informe um email válido.
        </p>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">
          Perfil <span class="text-error-500">*</span>
        </label>
        <SGSelect
          v-model="role"
          placeholder="Selecione o perfil"
          :options="roleOptions"
          test-id="select-invitation-role"
        />
      </div>
    </div>

    <div class="mt-5 flex justify-end">
      <SGButton
        variant="primary"
        test-id="submit-invitation-button"
        type="submit"
        :loading="loading"
        :disabled="!isValid || loading"
        icon="lucide:send"
      >
        Enviar convite
      </SGButton>
    </div>
  </form>
</template>
