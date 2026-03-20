<script setup lang="ts">
import type { CreateUserDto } from "~/interfaces/CreateUserDto";

const emit = defineEmits(["created"]);

const { createUser, loading } = useUsers();

const firstName = ref("");
const lastName = ref("");
const email = ref("");

const isValid = computed(() => {
  return firstName.value.trim().length > 0 && lastName.value.trim().length > 0 && email.value.trim().length > 0;
});

const handleSubmit = async () => {
  if (!isValid.value || loading.value) return;

  const payload: CreateUserDto = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    email: email.value.trim(),
  };

  try {
    await createUser(payload);
    firstName.value = "";
    lastName.value = "";
    email.value = "";
    emit("created");
  } catch {
    // error handled by composable
  }
};
</script>

<template>
  <form data-testid="user-form" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Nome <span class="text-error-500">*</span> </label>
        <SGInput v-model="firstName" placeholder="Ex: João" test-id="input-first-name" />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Sobrenome <span class="text-error-500">*</span> </label>
        <SGInput v-model="lastName" placeholder="Ex: Silva" test-id="input-last-name" />
      </div>

      <div class="sm:col-span-2">
        <label class="mb-1.5 block text-sm font-medium text-neutral-700"> Email <span class="text-error-500">*</span> </label>
        <SGInput v-model="email" type="email" placeholder="Ex: joao.silva@email.com" test-id="input-email" icon="lucide:mail" />
      </div>
    </div>

    <div class="mt-5 flex justify-end">
      <SGButton
        variant="primary"
        test-id="submit-user-button"
        type="submit"
        :loading="loading"
        :disabled="!isValid || loading"
        icon="lucide:user-plus"
      >
        Adicionar Usuário
      </SGButton>
    </div>
  </form>
</template>
