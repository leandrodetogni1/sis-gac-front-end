<script setup lang="ts">
useHead({ title: "Configurações — SWGAC" });

const { user } = useAuthState();

if (user.value && user.value.role !== "owner") {
  await navigateTo("/");
}
</script>

<template>
  <NuxtPage />
</template>
