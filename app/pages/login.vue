<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: "Entrar — SISGAC" });

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
  <div class="flex min-h-screen flex-col lg:flex-row">
    <section
      class="relative flex flex-col overflow-hidden bg-linear-to-br from-primary-600 via-primary-700 to-primary-800 px-6 py-10 sm:px-10 lg:flex-1 lg:px-16 lg:py-16"
      aria-labelledby="brand-wordmark"
    >
      <div class="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary-400/15 blur-3xl" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-32 -left-24 h-112 w-md rounded-full bg-primary-400/15 blur-3xl" aria-hidden="true" />
      <div class="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay" aria-hidden="true" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 24px 24px;" />

      <div class="relative flex items-center gap-3">
        <div class="h-px w-8 bg-white/40" />
        <span class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
          Sistema de Gestão Acadêmica
        </span>
      </div>

      <div class="relative flex flex-1 flex-col justify-center py-12 lg:py-0">
        <h1
          id="brand-wordmark"
          class="select-none text-6xl font-extrabold italic leading-none tracking-tighter text-white sm:text-7xl lg:text-8xl xl:text-9xl"
        >
          SISGAC
        </h1>
        <p class="mt-6 max-w-lg text-base text-white/75 sm:text-lg lg:text-xl">
          Gestão de Atividades Complementares.
          <span class="block text-white/50">Cadastre, valide e acompanhe o progresso curricular.</span>
        </p>
      </div>

      <div class="relative mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-white/50 lg:mt-0">
        <span>© 2026 SISGAC</span>
        <span class="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Sistema online
        </span>
      </div>
    </section>

    <section
      class="flex w-full items-center justify-center bg-white px-6 py-12 sm:px-10 lg:w-136 lg:px-12"
      aria-label="Autenticação"
    >
      <div class="w-full max-w-sm">
        <div class="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-600">
          <span class="h-1 w-1 rounded-full bg-primary-600" />
          Bem-vindo
        </div>

        <h2 class="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Acesse sua conta
        </h2>

        <p class="mt-3 text-sm leading-relaxed text-neutral-500">
          Use sua conta Google para entrar. Apenas usuários previamente cadastrados podem acessar.
        </p>

        <div class="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4">
          <div class="mb-3 flex items-center gap-2">
            <Icon name="lucide:shield-check" size="0.875rem" class="text-primary-600" />
            <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-700">
              Autenticação segura
            </span>
          </div>

          <div class="flex min-h-11 items-center justify-center">
            <div ref="buttonRef" data-testid="google-signin-button" />
          </div>
        </div>

        <div
          v-if="error"
          class="mt-4 flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 px-3 py-2.5"
          data-testid="login-error"
          role="alert"
        >
          <Icon name="lucide:circle-alert" size="1rem" class="mt-0.5 shrink-0 text-error-600" />
          <p class="text-sm text-error-700">{{ error }}</p>
        </div>

        <div
          v-else-if="loading"
          class="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-400"
        >
          <span class="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500" />
          Carregando autenticação...
        </div>

        <div class="mt-8 flex items-center gap-3">
          <div class="h-px flex-1 bg-neutral-200" />
          <span class="text-[10px] font-medium uppercase tracking-widest text-neutral-400">Suporte</span>
          <div class="h-px flex-1 bg-neutral-200" />
        </div>

        <p class="mt-4 text-center text-xs leading-relaxed text-neutral-400">
          Problemas para entrar? Entre em contato com o administrador do sistema.
        </p>
      </div>
    </section>
  </div>
</template>
