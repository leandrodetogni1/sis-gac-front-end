<script setup lang="ts">
const isSidebarOpen = ref(false);

interface NavChild {
  label: string;
  icon: string;
  to: string;
  testId: string;
  adminOnly?: boolean;
}

interface NavItem {
  label: string;
  icon: string;
  to: string;
  testId: string;
  children?: NavChild[];
  adminOnly?: boolean;
  ownerOnly?: boolean;
  memberOnly?: boolean;
  staffOnly?: boolean;
}

const allNavItems: NavItem[] = [
  { label: "Dashboard", icon: "lucide:layout-dashboard", to: "/", testId: "sidebar-link-dashboard" },
  { label: "Minhas Atividades", icon: "lucide:file-text", to: "/activities/me", testId: "sidebar-link-minhas-atividades", memberOnly: true },
  { label: "Atividades", icon: "lucide:file-text", to: "/activities", testId: "sidebar-link-atividades", staffOnly: true },
  { label: "Alunos", icon: "lucide:graduation-cap", to: "/members", testId: "sidebar-link-alunos", adminOnly: true },
  {
    label: "Configurações",
    icon: "lucide:settings",
    to: "/config",
    testId: "sidebar-link-configuracoes",
    ownerOnly: true,
    children: [
      { label: "Usuários", icon: "lucide:users", to: "/config/users", testId: "sidebar-link-users" },
      { label: "Currículos", icon: "lucide:book-open", to: "/config/curriculos", testId: "sidebar-link-curriculos" },
      { label: "Auditoria", icon: "lucide:scroll-text", to: "/config/audit", testId: "sidebar-link-audit" },
    ],
  },
];

const { user } = useAuthState();

const isOwner = computed(() => user.value?.role === "owner");
const isAdminOrOwner = computed(() => user.value?.role === "admin" || user.value?.role === "owner");
const isMember = computed(() => user.value?.role === "member");
const isStaff = computed(() => {
  const role = user.value?.role;
  return role === "reviewer" || role === "admin" || role === "owner";
});

const navItems = computed(() => {
  return allNavItems.filter((item) => {
    if (item.adminOnly && !isAdminOrOwner.value) return false;
    if (item.ownerOnly && !isOwner.value) return false;
    if (item.memberOnly && !isMember.value) return false;
    if (item.staffOnly && !isStaff.value) return false;
    return true;
  });
});

const currentRoute = useRoute();

const expandedMenus = ref<string[]>([]);

const isItemActive = (item: NavItem) => {
  if (item.to === "/") return currentRoute.path === "/";
  return currentRoute.path.startsWith(item.to);
};

const isChildActive = (child: NavChild) => currentRoute.path === child.to;

const toggleMenu = (to: string) => {
  const idx = expandedMenus.value.indexOf(to);
  if (idx >= 0) {
    expandedMenus.value.splice(idx, 1);
  } else {
    expandedMenus.value = [to];
  }
};

const isExpanded = (item: NavItem) => {
  return expandedMenus.value.includes(item.to);
};

watch(
  () => currentRoute.path,
  (path) => {
    const activeParent = navItems.value.find((item) => item.children && path.startsWith(item.to));
    expandedMenus.value = activeParent ? [activeParent.to] : [];
    isSidebarOpen.value = false;
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex min-h-screen bg-neutral-50">
    <Transition name="fade">
      <div v-if="isSidebarOpen" class="fixed inset-x-0 bottom-0 top-16 z-30 bg-primary-950/60 backdrop-blur-sm lg:hidden" data-testid="sidebar-overlay" @click="isSidebarOpen = false" />
    </Transition>

    <aside
      :class="[
        'fixed bottom-0 left-0 top-16 z-40 flex w-full flex-col overflow-hidden bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:bottom-auto lg:h-screen lg:w-64 lg:translate-x-0 lg:bg-linear-to-b lg:from-primary-600 lg:via-primary-700 lg:to-primary-800 lg:shadow-none',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      data-testid="sidebar"
    >
      <div class="pointer-events-none absolute -right-16 -top-16 hidden h-64 w-64 rounded-full bg-secondary-400/10 blur-3xl lg:block" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-24 -left-16 hidden h-72 w-72 rounded-full bg-primary-400/10 blur-3xl lg:block" aria-hidden="true" />

      <div class="relative hidden h-16 shrink-0 items-center justify-center lg:flex">
        <NuxtLink
          to="/"
          class="select-none text-3xl font-extrabold italic tracking-tighter text-white transition-opacity hover:opacity-80"
          aria-label="SISGAC"
        >
          SISGAC
        </NuxtLink>
      </div>

        <nav class="relative flex-1 space-y-1.5 overflow-y-auto px-4 py-6 lg:space-y-1 lg:px-3 lg:py-5">
          <template v-for="item in navItems" :key="item.to">
            <template v-if="item.children">
              <button
                :data-testid="item.testId"
                :class="[
                  'group relative flex min-h-12 w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium transition-colors duration-200 lg:min-h-11 lg:py-2.5 lg:text-sm',
                  isItemActive(item)
                    ? 'bg-primary-50 text-primary-700 lg:bg-white/10 lg:text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 lg:text-white/70 lg:hover:bg-white/5 lg:hover:text-white',
                ]"
                @click="toggleMenu(item.to)"
              >
                <span
                  v-if="isItemActive(item)"
                  class="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-600 lg:bg-white"
                  aria-hidden="true"
                />
                <span class="flex items-center gap-3">
                  <Icon :name="item.icon" size="1.25rem" />
                  {{ item.label }}
                </span>
                <Icon
                  name="lucide:chevron-down"
                  size="1rem"
                  :class="['text-neutral-400 transition-transform duration-200 lg:text-white/50', isExpanded(item) ? 'rotate-180' : '']"
                />
              </button>

              <div v-if="isExpanded(item)" class="mt-1 space-y-0.5 pl-3">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  :data-testid="child.testId"
                  :class="[
                    'flex min-h-12 items-center gap-3 rounded-lg border-l border-neutral-200 px-3 py-2.5 text-base font-medium transition-colors duration-200 lg:min-h-11 lg:border-white/10 lg:py-2 lg:text-sm',
                    isChildActive(child)
                      ? 'border-primary-600 bg-primary-50 text-primary-700 lg:border-white lg:bg-white/10 lg:text-white'
                      : 'text-neutral-500 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 lg:text-white/60 lg:hover:border-white/30 lg:hover:bg-white/5 lg:hover:text-white',
                  ]"
                  @click="isSidebarOpen = false"
                >
                  <Icon :name="child.icon" size="1.125rem" />
                  {{ child.label }}
                </NuxtLink>
              </div>
            </template>

            <NuxtLink
              v-else
              :to="item.to"
              :data-testid="item.testId"
              :class="[
                'group relative flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors duration-200 lg:min-h-11 lg:py-2.5 lg:text-sm',
                isItemActive(item)
                  ? 'bg-primary-50 text-primary-700 lg:bg-white/10 lg:text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 lg:text-white/70 lg:hover:bg-white/5 lg:hover:text-white',
              ]"
              @click="isSidebarOpen = false"
            >
              <span
                v-if="isItemActive(item)"
                class="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-600 lg:bg-white"
                aria-hidden="true"
              />
              <Icon :name="item.icon" size="1.25rem" />
              {{ item.label }}
            </NuxtLink>
          </template>
        </nav>

        <div class="relative px-6 pb-5 pt-3">
          <p class="text-xs font-semibold uppercase tracking-widest text-neutral-400 lg:text-white/50">
            v1.0
          </p>
        </div>
      </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <app-topbar :is-sidebar-open="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <main class="min-w-0 flex-1 p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
