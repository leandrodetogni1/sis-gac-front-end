<script setup lang="ts">
import type { AuditLogResponseDto } from "~/interfaces/AuditLogResponseDto";

const props = defineProps<{
  row: AuditLogResponseDto;
  loading?: boolean;
  testSuffix?: string;
}>();

const emit = defineEmits(["open-activity"]);

const roleLabel = (role: string) => {
  const r = role.toLowerCase();
  if (r === "owner") return "Owner";
  if (r === "admin") return "Admin";
  if (r === "reviewer") return "Reviewer";
  if (r === "member") return "Aluno";
  return role;
};

const suffix = computed(() => props.testSuffix ?? "");

const contextText = computed(() => {
  const meta = props.row.metadata;
  if (!meta) return null;
  if (props.row.entityType === "user") {
    if (meta.label && meta.email) return `${meta.label} (${meta.email})`;
    return meta.label ?? meta.email ?? null;
  }
  if (props.row.entityType === "invitation") {
    const base = meta.email ? `para ${meta.email}` : meta.label;
    if (!base) return null;
    return meta.role ? `${base} — ${roleLabel(meta.role)}` : base;
  }
  return meta.label ?? null;
});

const isUserLink = computed(() => {
  return props.row.entityType === "user" && Boolean(props.row.entityId) && props.row.action !== "user.deleted";
});

const isActivityLink = computed(() => {
  return props.row.entityType === "activity" && Boolean(props.row.entityId);
});
</script>

<template>
  <NuxtLink
    v-if="contextText && isUserLink"
    :to="`/members/${row.entityId}`"
    class="mt-1 flex max-w-[16rem] items-center gap-1 text-xs text-neutral-500 hover:underline"
    :data-testid="`audit-context-link-${row.id}${suffix}`"
  >
    <span class="truncate" :title="contextText">{{ contextText }}</span>
    <Icon name="lucide:arrow-up-right" size="0.75rem" class="shrink-0" />
  </NuxtLink>
  <button
    v-else-if="contextText && isActivityLink"
    type="button"
    :disabled="loading"
    class="mt-1 flex max-w-[16rem] items-center gap-1 text-left text-xs text-neutral-500 hover:underline disabled:cursor-wait disabled:opacity-60"
    :data-testid="`audit-context-activity-${row.id}${suffix}`"
    @click="emit('open-activity', row)"
  >
    <span class="truncate" :title="contextText">{{ contextText }}</span>
    <Icon v-if="loading" name="lucide:loader-circle" size="0.75rem" class="shrink-0 animate-spin" />
    <Icon v-else name="lucide:arrow-up-right" size="0.75rem" class="shrink-0" />
  </button>
  <p v-else-if="contextText" class="mt-1 max-w-[16rem] truncate text-xs text-neutral-500" :title="contextText">
    {{ contextText }}
  </p>
  <NuxtLink
    v-else-if="isUserLink"
    :to="`/members/${row.entityId}`"
    class="mt-1 flex max-w-[16rem] items-center gap-1 text-xs text-neutral-500 hover:underline"
    :data-testid="`audit-context-link-${row.id}${suffix}`"
  >
    <span>Ver membro</span>
    <Icon name="lucide:arrow-up-right" size="0.75rem" class="shrink-0" />
  </NuxtLink>
</template>
