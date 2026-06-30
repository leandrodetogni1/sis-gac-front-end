<script setup lang="ts">
defineProps<{
  label?: string;
  linkClass?: string;
}>();

const email = ["ldtogni", "inf.ufpel.edu.br"].join("@");
const href = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
</script>

<template>
  <ClientOnly>
    <a :href="href" target="_blank" rel="noopener noreferrer" :class="linkClass">{{ label ?? email }}</a>
    <template #fallback>
      <span :class="linkClass">{{ label ?? "nosso e-mail de contato" }}</span>
    </template>
  </ClientOnly>
</template>
