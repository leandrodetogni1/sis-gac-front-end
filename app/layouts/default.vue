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
  <div class="flex min-h-screen flex-col bg-neutral-50">
    <app-topbar :is-sidebar-open="isSidebarOpen" @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="flex flex-1">
      <Transition name="fade">
        <div v-if="isSidebarOpen" class="fixed inset-x-0 bottom-0 top-16 z-30 bg-primary-950/60 backdrop-blur-sm lg:hidden" data-testid="sidebar-overlay" @click="isSidebarOpen = false" />
      </Transition>

      <aside
        :class="[
          'fixed bottom-0 left-0 top-16 z-40 flex w-64 flex-col overflow-hidden bg-linear-to-b from-primary-600 via-primary-700 to-primary-800 shadow-2xl shadow-primary-950/30 transition-transform duration-300 lg:sticky lg:bottom-auto lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:shadow-none',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ]"
        data-testid="sidebar"
      >
        <div class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-secondary-400/10 blur-3xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary-400/10 blur-3xl" aria-hidden="true" />

        <nav class="relative flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <template v-for="item in navItems" :key="item.to">
            <template v-if="item.children">
              <button
                :data-testid="item.testId"
                :class="[
                  'group relative flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                  isItemActive(item)
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white',
                ]"
                @click="toggleMenu(item.to)"
              >
                <span
                  v-if="isItemActive(item)"
                  class="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white"
                  aria-hidden="true"
                />
                <span class="flex items-center gap-3">
                  <Icon :name="item.icon" size="1.25rem" />
                  {{ item.label }}
                </span>
                <Icon
                  name="lucide:chevron-down"
                  size="1rem"
                  :class="['text-white/50 transition-transform duration-200', isExpanded(item) ? 'rotate-180' : '']"
                />
              </button>

              <div v-if="isExpanded(item)" class="mt-1 space-y-0.5 pl-3">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  :data-testid="child.testId"
                  :class="[
                    'flex items-center gap-3 rounded-lg border-l border-white/10 px-3 py-2 text-sm font-medium transition-colors duration-200',
                    isChildActive(child)
                      ? 'border-white bg-white/10 text-white'
                      : 'text-white/60 hover:border-white/30 hover:bg-white/5 hover:text-white',
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
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                isItemActive(item)
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white',
              ]"
              @click="isSidebarOpen = false"
            >
              <span
                v-if="isItemActive(item)"
                class="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white"
                aria-hidden="true"
              />
              <Icon :name="item.icon" size="1.25rem" />
              {{ item.label }}
            </NuxtLink>
          </template>
        </nav>

        <div class="relative px-6 pb-5 pt-3">
          <p class="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            v1.0
          </p>
        </div>
      </aside>

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
