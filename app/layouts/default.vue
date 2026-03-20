<script setup lang="ts">
const isSidebarOpen = ref(false);

interface NavChild {
  label: string;
  icon: string;
  to: string;
  testId: string;
}

interface NavItem {
  label: string;
  icon: string;
  to: string;
  testId: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "lucide:layout-dashboard", to: "/", testId: "sidebar-link-dashboard" },
  { label: "Atividades", icon: "lucide:file-text", to: "/activities", testId: "sidebar-link-atividades" },
  {
    label: "Configurações",
    icon: "lucide:settings",
    to: "/config",
    testId: "sidebar-link-configuracoes",
    children: [
      { label: "Usuários", icon: "lucide:users", to: "/config/users", testId: "sidebar-link-users" },
      { label: "Atividades", icon: "lucide:file-text", to: "/config/activity-types", testId: "sidebar-link-activity-types" },
    ],
  },
];

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
    expandedMenus.value.push(to);
  }
};

const isExpanded = (item: NavItem) => {
  return expandedMenus.value.includes(item.to) || isItemActive(item);
};

const pageTitle = computed(() => {
  const item = navItems.find((n) => (n.to === "/" ? currentRoute.path === "/" : currentRoute.path.startsWith(n.to)));
  return item?.label ?? "SWGAC";
});
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
      <NuxtLink to="/" class="flex h-30 items-center gap-3 border-b border-neutral-200 px-6">
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
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">U</div>
          <div class="flex-1 truncate">
            <p class="text-sm font-medium text-neutral-900">Usuário</p>
            <p class="truncate text-xs text-neutral-500">usuario@email.com</p>
          </div>
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
