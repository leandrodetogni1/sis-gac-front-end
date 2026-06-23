<script setup lang="ts">
import type { UserResponseDto } from "~/interfaces/UserResponseDto";

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  testId?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const { users, loading, getUsers, getUser } = useUsers();

const SELECTABLE_ROLES = new Set(["member", "reviewer", "admin"]);

const open = ref(false);
const search = ref("");
const loaded = ref(false);
const selectedUser = ref<UserResponseDto | null>(null);

const fullName = (user: UserResponseDto) => `${user.firstName} ${user.lastName}`.trim();

const roleLabel = (role: string | null) => {
  const r = role?.toLowerCase();
  if (r === "admin") return "Admin";
  if (r === "reviewer") return "Reviewer";
  if (r === "member") return "Aluno";
  return role ?? "";
};

const actors = computed(() =>
  users.value
    .filter((user) => user.role && SELECTABLE_ROLES.has(user.role.toLowerCase()))
    .sort((a, b) => fullName(a).localeCompare(fullName(b), "pt-BR")),
);

const selected = computed(
  () => selectedUser.value ?? actors.value.find((user) => user.id === props.modelValue) ?? null,
);

const fetchActors = () => getUsers({ search: search.value.trim() || undefined, pageSize: 100 });

const ensureUsers = async () => {
  if (loaded.value) return;
  loaded.value = true;
  await fetchActors();
};

let searchTimer: ReturnType<typeof setTimeout> | undefined;

watch(search, () => {
  if (!open.value) return;
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(fetchActors, 300);
});

const select = (user: UserResponseDto) => {
  selectedUser.value = user;
  emit("update:modelValue", user.id);
  open.value = false;
  search.value = "";
};

const clear = () => {
  selectedUser.value = null;
  emit("update:modelValue", "");
};

watch(open, (isOpen) => {
  if (isOpen) ensureUsers();
});

onMounted(async () => {
  if (props.modelValue) {
    selectedUser.value = await getUser(props.modelValue);
  }
});

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<template>
  <div
    v-if="selected"
    class="flex min-h-11 w-full items-center gap-2.5 rounded-md border border-accented bg-default px-2.5 py-1.5 sm:min-h-8"
    :data-testid="testId ? `${testId}-selected` : undefined"
  >
    <SGAvatar :first-name="selected.firstName" :last-name="selected.lastName" :picture="selected.picture" size="xs" />
    <span class="min-w-0 flex-1 truncate text-base text-default sm:text-sm">{{ fullName(selected) }}</span>
    <button
      type="button"
      class="shrink-0 rounded p-0.5 text-dimmed transition-colors hover:bg-neutral-100 hover:text-neutral-700"
      :data-testid="testId ? `${testId}-clear` : undefined"
      @click="clear"
    >
      <Icon name="lucide:x" size="1rem" />
    </button>
  </div>

  <UPopover
    v-else
    v-model:open="open"
    :ui="{ content: 'w-(--reka-popper-anchor-width)' }"
  >
    <button
      type="button"
      :data-testid="testId"
      class="flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-accented bg-default px-2.5 py-1.5 text-base transition-colors hover:border-inverted focus:outline-none focus:ring-2 focus:ring-primary sm:min-h-8 sm:text-sm"
    >
      <span class="flex items-center gap-2 text-dimmed">
        <Icon name="lucide:user-search" size="1rem" class="shrink-0" />
        {{ placeholder ?? "Filtrar por ator" }}
      </span>
      <Icon name="lucide:chevron-down" size="1rem" class="shrink-0 text-dimmed" />
    </button>

    <template #content>
      <div class="flex max-h-80 flex-col">
        <div class="border-b border-neutral-100 p-2">
          <SGInput v-model="search" placeholder="Buscar usuário..." icon="lucide:search" test-id="audit-filter-actor-search" />
        </div>
        <div class="overflow-y-auto p-1">
          <div v-if="loading" class="flex items-center justify-center py-6 text-sm text-neutral-400">
            Carregando...
          </div>
          <template v-else>
            <button
              v-for="user in actors"
              :key="user.id"
              type="button"
              class="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-neutral-50"
              :data-testid="`audit-filter-actor-option-${user.id}`"
              @click="select(user)"
            >
              <SGAvatar :first-name="user.firstName" :last-name="user.lastName" :picture="user.picture" size="sm" />
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-neutral-900">{{ fullName(user) }}</span>
                <span class="block truncate text-xs text-neutral-400">{{ user.email }}</span>
              </span>
              <span class="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">{{ roleLabel(user.role) }}</span>
            </button>
            <div v-if="!actors.length" class="py-6 text-center text-sm text-neutral-400">
              Nenhum usuário encontrado
            </div>
          </template>
        </div>
      </div>
    </template>
  </UPopover>
</template>
