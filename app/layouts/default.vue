<script setup lang="ts">
const isSidebarOpen = ref(false);

const navItems = [
  { label: "Dashboard", icon: "lucide:layout-dashboard", to: "/", testId: "sidebar-link-dashboard" },
  { label: "Atividades", icon: "lucide:file-text", to: "/atividades", testId: "sidebar-link-atividades" },
  { label: "Certificados", icon: "lucide:award", to: "/certificados", testId: "sidebar-link-certificados" },
  { label: "Configurações", icon: "lucide:settings", to: "/configuracoes", testId: "sidebar-link-configuracoes" },
];

const currentRoute = useRoute();

const pageTitle = computed(() => {
  const item = navItems.find((n) => n.to === currentRoute.path);
  return item?.label ?? "SWGAC";
});
</script>

<template>
  <div class="flex min-h-screen">
    <Transition name="fade">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-30 bg-black/40 lg:hidden"
        data-testid="sidebar-overlay"
        @click="isSidebarOpen = false"
      />
    </Transition>

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      data-testid="sidebar"
    >
      <div class="flex h-16 items-center gap-3 border-b border-neutral-200 px-6">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-sm font-bold text-white">
          S
        </div>
        <span class="text-lg font-bold text-neutral-900">SWGAC</span>
      </div>

      <nav class="flex-1 space-y-1 p-4">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :data-testid="item.testId"
          :class="[
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            currentRoute.path === item.to
              ? 'bg-secondary-100 text-primary-500'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
          ]"
          @click="isSidebarOpen = false"
        >
          <Icon :name="item.icon" size="1.25rem" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="border-t border-neutral-200 p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
            U
          </div>
          <div class="flex-1 truncate">
            <p class="text-sm font-medium text-neutral-900">Usuário</p>
            <p class="truncate text-xs text-neutral-500">usuario@email.com</p>
          </div>
        </div>
      </div>
    </aside>

    <div class="flex flex-1 flex-col">
      <header
        class="flex h-16 items-center gap-4 border-b border-neutral-200 bg-white px-4 md:px-6"
        data-testid="header"
      >
        <button
          class="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
          data-testid="sidebar-toggle"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <Icon name="lucide:menu" size="1.25rem" />
        </button>

        <h1 class="text-lg font-semibold text-neutral-900 md:text-xl">
          {{ pageTitle }}
        </h1>
      </header>

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
