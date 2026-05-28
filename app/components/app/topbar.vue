<script setup lang="ts">
defineProps<{
  isSidebarOpen: boolean;
}>();

const emit = defineEmits(["toggle-sidebar"]);

const { user } = useAuthState();
const { signOut } = useGoogleSignIn();
const route = useRoute();

const userFullName = computed(() => {
  if (!user.value) return "Usuário";
  return `${user.value.firstName} ${user.value.lastName}`.trim();
});

const userFirstName = computed(() => user.value?.firstName ?? "Usuário");

const roleLabel = computed(() => {
  const map: Record<string, string> = {
    owner: "Proprietário",
    admin: "Administrador",
    reviewer: "Revisor",
    member: "Aluno",
  };
  return map[user.value?.role ?? ""] ?? null;
});

const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (!isMenuOpen.value) return;
  const target = event.target as Node | null;
  if (target && menuRef.value && !menuRef.value.contains(target)) {
    isMenuOpen.value = false;
  }
};

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") isMenuOpen.value = false;
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
});

watch(
  () => route.path,
  () => {
    isMenuOpen.value = false;
  },
);

const handleSignOut = async () => {
  isMenuOpen.value = false;
  await signOut();
};
</script>

<template>
  <header
    class="sticky top-0 z-50 flex h-16 items-stretch"
    data-testid="topbar"
  >
    <div class="flex shrink-0 items-center gap-3 bg-linear-to-b from-primary-500 to-primary-600 px-4 md:px-6 lg:w-64">
      <button
        class="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 active:bg-white/20 lg:hidden"
        data-testid="topbar-menu-button"
        :aria-label="isSidebarOpen ? 'Fechar menu' : 'Abrir menu'"
        :aria-expanded="isSidebarOpen"
        @click="emit('toggle-sidebar')"
      >
        <Icon name="lucide:menu" size="1.5rem" />
      </button>

      <NuxtLink
        to="/"
        class="select-none text-2xl font-extrabold italic tracking-tighter text-white transition-opacity hover:opacity-80 md:text-3xl"
        aria-label="SISGAC"
      >
        SISGAC
      </NuxtLink>
    </div>

    <div class="flex flex-1 items-center justify-end gap-3 border-b border-neutral-200 bg-white px-4 md:px-6">
      <div ref="menuRef" class="relative">
      <button
        :class="[
          'flex items-center gap-2.5 rounded-full border p-1 transition-all duration-200 md:pr-3',
          isMenuOpen
            ? 'border-primary-200 bg-primary-50 shadow-sm'
            : 'border-transparent hover:border-neutral-200 hover:bg-neutral-50',
        ]"
        data-testid="topbar-user-button"
        :aria-haspopup="true"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        <SGAvatar
          :first-name="user?.firstName"
          :last-name="user?.lastName"
          :picture="user?.picture ?? null"
          size="md"
        />
        <div class="hidden flex-col items-start leading-tight md:flex">
          <span class="max-w-40 truncate text-sm font-semibold text-neutral-900">
            {{ userFirstName }}
          </span>
          <span v-if="roleLabel" class="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
            {{ roleLabel }}
          </span>
        </div>
        <Icon
          name="lucide:chevron-down"
          size="1rem"
          :class="['hidden text-neutral-400 transition-transform duration-200 md:inline', isMenuOpen ? 'rotate-180' : '']"
        />
      </button>

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="-translate-y-1 scale-95 opacity-0"
        enter-to-class="translate-y-0 scale-100 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="translate-y-0 scale-100 opacity-100"
        leave-to-class="-translate-y-1 scale-95 opacity-0"
      >
        <div
          v-if="isMenuOpen"
          class="absolute right-0 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-primary-950/15 ring-1 ring-black/5"
          data-testid="topbar-user-menu"
          role="menu"
        >
          <div class="relative overflow-hidden bg-linear-to-br from-primary-600 via-primary-700 to-primary-800 px-4 py-5">
            <div class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-secondary-400/20 blur-2xl" aria-hidden="true" />
            <div class="pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-primary-400/20 blur-2xl" aria-hidden="true" />

            <div class="relative flex items-center gap-3">
              <div class="rounded-full ring-2 ring-white/40">
                <SGAvatar
                  :first-name="user?.firstName"
                  :last-name="user?.lastName"
                  :picture="user?.picture ?? null"
                  size="lg"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-white" data-testid="topbar-menu-user-name">
                  {{ userFullName }}
                </p>
                <p class="truncate text-xs text-white/70" data-testid="topbar-menu-user-email">
                  {{ user?.email ?? "" }}
                </p>
                <span
                  v-if="roleLabel"
                  class="mt-2 inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm"
                >
                  {{ roleLabel }}
                </span>
              </div>
            </div>
          </div>

          <div class="p-1.5">
            <button
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error-600 transition-colors hover:bg-error-50 active:bg-error-100"
              data-testid="topbar-logout-button"
              role="menuitem"
              @click="handleSignOut"
            >
              <Icon name="lucide:log-out" size="1.125rem" />
              Sair da conta
            </button>
          </div>
        </div>
      </Transition>
      </div>
    </div>
  </header>
</template>
