<script setup lang="ts">
const route = useRoute();

const tabs = [
  { label: "Todos os alunos", to: "/members", icon: "lucide:users", testId: "members-tab-todos" },
  { label: "Aptos a colar grau", to: "/members/formandos-aptos", icon: "lucide:award", testId: "members-tab-aptos" },
];

const isActive = (to: string) => route.path === to;
</script>

<template>
  <nav class="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-1" data-testid="members-tabs">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      :data-testid="tab.testId"
      :class="[
        'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-colors sm:min-h-8',
        isActive(tab.to) ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700',
      ]"
    >
      <Icon :name="tab.icon" size="1rem" />
      {{ tab.label }}
    </NuxtLink>
  </nav>
</template>
