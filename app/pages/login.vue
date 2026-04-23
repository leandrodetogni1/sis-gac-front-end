<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: "Entrar — SWGAC" });

const { renderButton } = useGoogleSignIn();
const buttonRef = ref<HTMLElement | null>(null);
const error = ref<string | null>(null);
const loading = ref(true);

onMounted(async () => {
  if (!buttonRef.value) return;
  try {
    await renderButton(buttonRef.value);
  } catch (e: any) {
    error.value = e?.message ?? "Erro ao carregar Google Sign-In";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
    <div class="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div class="mb-8 flex justify-center">
        <img src="/logo.png" alt="SWGAC" class="h-12" />
      </div>
      <h1 class="text-center text-xl font-bold text-neutral-900">Entrar no SWGAC</h1>
      <p class="mt-2 text-center text-sm text-neutral-500">Use sua conta Google para continuar</p>

      <div class="mt-8 flex min-h-[44px] justify-center">
        <div ref="buttonRef" data-testid="google-signin-button" />
      </div>

      <p v-if="error" class="mt-4 text-center text-sm text-error-500" data-testid="login-error">
        {{ error }}
      </p>
      <p v-else-if="loading" class="mt-4 text-center text-sm text-neutral-400">Carregando...</p>
    </div>
  </div>
</template>
