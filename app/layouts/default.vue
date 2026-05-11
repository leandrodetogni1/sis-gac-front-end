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
      { label: "Atividades", icon: "lucide:file-text", to: "/config/activity-types", testId: "sidebar-link-activity-types" },
    ],
  },
];

const { user } = useAuthState();
const { signOut } = useGoogleSignIn();

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

const userInitial = computed(() => (user.value?.firstName?.[0] ?? "U").toUpperCase());
const userFullName = computed(() => {
  if (!user.value) return "Usuário";
  return `${user.value.firstName} ${user.value.lastName}`.trim();
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
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex min-h-screen">
    <Transition name="fade">
      <div v-if="isSidebarOpen" class="fixed inset-0 z-30 bg-black/40 lg:hidden" data-testid="sidebar-overlay" @click="isSidebarOpen = false" />
    </Transition>

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      data-testid="sidebar"
    >
      <NuxtLink to="/" class="flex h-24 items-center gap-3 justify-center">
        <img src="/logo.png" alt="SWGAC" class="w-full max-w-52" />
      </NuxtLink>

      <nav class="flex-1 space-y-1 p-4">
        <template v-for="item in navItems" :key="item.to">
          <template v-if="item.children">
            <button
              :data-testid="item.testId"
              :class="[
                'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isItemActive(item) ? 'bg-secondary-100 text-primary-500' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
              ]"
              @click="toggleMenu(item.to)"
            >
              <span class="flex items-center gap-3">
                <Icon :name="item.icon" size="1.25rem" />
                {{ item.label }}
              </span>
              <Icon name="lucide:chevron-down" size="1rem" class="transition-transform duration-200" :class="isExpanded(item) ? 'rotate-180' : ''" />
            </button>

            <div v-if="isExpanded(item)" class="mt-1 space-y-0.5 pl-4">
              <NuxtLink
                v-for="child in item.children"
                :key="child.to"
                :to="child.to"
                :data-testid="child.testId"
                :class="[
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  isChildActive(child) ? 'bg-secondary-100 text-primary-500' : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900',
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
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isItemActive(item) ? 'bg-secondary-100 text-primary-500' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
            ]"
            @click="isSidebarOpen = false"
          >
            <Icon :name="item.icon" size="1.25rem" />
            {{ item.label }}
          </NuxtLink>
        </template>
      </nav>

      <div class="border-t border-neutral-200 p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
            {{ userInitial }}
          </div>
          <div class="flex-1 truncate">
            <p class="text-sm font-medium text-neutral-900" data-testid="sidebar-user-name">{{ userFullName }}</p>
            <p class="truncate text-xs text-neutral-500" data-testid="sidebar-user-email">{{ user?.email ?? "" }}</p>
          </div>
          <button
            class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            data-testid="logout-button"
            title="Sair"
            @click="signOut"
          >
            <Icon name="lucide:log-out" size="1.125rem" />
          </button>
        </div>
      </div>
    </aside>

    <div class="flex flex-1 flex-col">
      <main class="flex-1 p-4 md:p-6">
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
