<script setup lang="ts">
useHead({ title: "Dashboard — SWGAC" });

const { user } = useAuthState();

const isMember = computed(() => user.value?.role === "member");
const isStaff = computed(() => {
  const role = user.value?.role;
  return role === "reviewer" || role === "admin" || role === "owner";
});
</script>

<template>
  <dashboard-member-summary v-if="isMember" />
  <dashboard-admin-summary v-else-if="isStaff" />
</template>
