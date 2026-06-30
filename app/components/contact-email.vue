<script setup lang="ts">
defineProps<{
  label?: string;
  linkClass?: string;
}>();

const email = ["ldtogni", "inf.ufpel.edu.br"].join("@");
const href = `mailto:${email}`;
</script>

<template>
  <ClientOnly>
    <a :href="href" :class="linkClass">{{ label ?? email }}</a>
    <template #fallback>
      <span :class="linkClass">{{ label ?? "nosso e-mail de contato" }}</span>
    </template>
  </ClientOnly>
</template>
