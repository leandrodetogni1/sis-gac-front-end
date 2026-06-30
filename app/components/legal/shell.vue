<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
  updatedAt: string;
  otherTo: string;
  otherLabel: string;
}>();
</script>

<template>
  <div class="min-h-dvh bg-neutral-50">
    <header class="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800"
        >
          <Icon name="lucide:arrow-left" size="1rem" />
          Voltar ao login
        </NuxtLink>
        <span class="text-sm font-extrabold italic tracking-tight text-primary-700">SISGAC</span>
      </div>
    </header>

    <section class="relative overflow-hidden bg-linear-to-br from-primary-600 via-primary-700 to-primary-800 px-6 py-10 sm:py-14">
      <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary-400/15 blur-3xl" aria-hidden="true" />
      <div class="relative mx-auto max-w-3xl">
        <div class="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">{{ eyebrow }}</div>
        <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">{{ title }}</h1>
        <p class="mt-3 text-sm text-white/70">Última atualização: {{ updatedAt }}</p>
      </div>
    </section>

    <main class="mx-auto max-w-3xl px-6 py-10 sm:py-12">
      <article
        class="space-y-9 text-sm leading-relaxed text-neutral-600 [&_a]:font-medium [&_a]:text-primary-600 [&_a]:underline [&_a]:underline-offset-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-900 [&_li]:marker:text-neutral-300 [&_p]:mt-3 [&_strong]:font-semibold [&_strong]:text-neutral-800 [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_td]:border-b [&_td]:border-neutral-100 [&_td]:py-2.5 [&_td]:pr-4 [&_td]:align-top [&_th]:border-b [&_th]:border-neutral-200 [&_th]:py-2 [&_th]:pr-4 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-neutral-500 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
      >
        <slot />
      </article>

      <div class="mt-12 rounded-2xl border border-neutral-200 bg-white p-5">
        <p class="text-xs font-semibold uppercase tracking-wider text-neutral-400">Documento relacionado</p>
        <NuxtLink :to="otherTo" class="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700">
          {{ otherLabel }}
          <Icon name="lucide:arrow-right" size="1rem" />
        </NuxtLink>
      </div>
    </main>

    <footer class="border-t border-neutral-200 bg-white">
      <div class="mx-auto max-w-3xl px-6 py-6 text-xs text-neutral-400">© 2026 SISGAC</div>
    </footer>
  </div>
</template>
