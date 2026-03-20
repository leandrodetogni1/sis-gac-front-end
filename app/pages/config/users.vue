<script setup lang="ts">
useHead({ title: "Usuários — Configurações — SWGAC" });

const { users, fetched, loading, error, getUsers, deleteUser } = useUsers();
const { showToastSuccess } = useToastNotification();
const { confirmAlert } = useAlerts();

const showForm = ref(false);

const handleCreated = async () => {
  showForm.value = false;
  showToastSuccess("Usuário adicionado com sucesso");
  await getUsers();
};

const handleDelete = async (id: string, name: string) => {
  const confirmed = await confirmAlert(
    `O usuário "${name}" será removido permanentemente.`,
    "Remover usuário?",
    "warning",
  );
  if (!confirmed) return;

  try {
    await deleteUser(id);
    showToastSuccess("Usuário removido com sucesso");
  } catch {
    // error handled by composable
  }
};

onMounted(async () => {
  await getUsers();
});
</script>

<template>
  <div>
    <div v-if="!fetched" class="flex min-h-[40vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando usuários...</p>
      </div>
    </div>

    <div v-else>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Usuários</h2>
        <SGButton
          test-id="toggle-user-form-button"
          :variant="showForm ? 'secondary' : 'primary'"
          :icon="showForm ? 'lucide:x' : 'lucide:user-plus'"
          @click="showForm = !showForm"
        >
          {{ showForm ? "Cancelar" : "Adicionar Usuário" }}
        </SGButton>
      </div>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-96 opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="max-h-96 opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <SGCard v-if="showForm" test-id="card-user-form" class="mb-6 overflow-hidden">
          <config-user-form @created="handleCreated" />
        </SGCard>
      </Transition>

      <SGCard test-id="card-users">
        <div v-if="error" class="flex flex-col items-center justify-center py-12" data-testid="error-state">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-error-50">
            <Icon name="lucide:wifi-off" size="2rem" class="text-error-400" />
          </div>
          <p class="mt-4 text-sm font-medium text-neutral-900">Falha ao carregar usuários</p>
          <p class="mt-1 text-sm text-neutral-500">{{ error }}</p>
          <SGButton test-id="retry-button" variant="primary" icon="lucide:refresh-cw" size="sm" class="mt-4" @click="getUsers()">
            Tentar novamente
          </SGButton>
        </div>

        <div v-else-if="users.length === 0" class="flex flex-col items-center justify-center py-12" data-testid="empty-state">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Icon name="lucide:users" size="2rem" class="text-neutral-400" />
          </div>
          <p class="mt-4 text-sm font-medium text-neutral-900">Nenhum usuário encontrado</p>
          <p class="mt-1 text-sm text-neutral-500">Comece adicionando o primeiro usuário.</p>
          <SGButton test-id="empty-state-add-button" variant="primary" icon="lucide:user-plus" size="sm" class="mt-4" @click="showForm = true">
            Adicionar Usuário
          </SGButton>
        </div>

        <div v-else>
          <div class="hidden overflow-x-auto md:block">
            <table class="w-full text-left text-sm" data-testid="users-table">
              <thead>
                <tr class="border-b border-neutral-200 text-xs font-medium uppercase text-neutral-500">
                  <th class="pb-3 pr-4">Nome</th>
                  <th class="pb-3 pr-4">Email</th>
                  <th class="pb-3 pr-4">Perfil</th>
                  <th class="pb-3 pr-4">Criado em</th>
                  <th class="pb-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in users"
                  :key="user.id"
                  class="border-b border-neutral-100 transition-colors hover:bg-neutral-50"
                  :data-testid="`user-row-${user.id}`"
                >
                  <td class="py-3 pr-4">
                    <div class="flex items-center gap-2.5">
                      <div
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600"
                      >
                        {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                      </div>
                      <span class="font-medium text-neutral-900">{{ user.firstName }} {{ user.lastName }}</span>
                    </div>
                  </td>
                  <td class="py-3 pr-4 text-neutral-500">{{ user.email }}</td>
                  <td class="py-3 pr-4 text-neutral-500">{{ user.role ?? "—" }}</td>
                  <td class="py-3 pr-4 text-neutral-500">{{ user.createdAt ?? "—" }}</td>
                  <td class="py-3 text-right">
                    <button
                      :data-testid="`delete-user-${user.id}`"
                      class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500"
                      :disabled="loading"
                      @click="handleDelete(user.id, `${user.firstName} ${user.lastName}`)"
                    >
                      <Icon name="lucide:trash-2" size="1rem" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="space-y-3 md:hidden">
            <div v-for="user in users" :key="user.id" class="rounded-lg border border-neutral-200 p-3" :data-testid="`user-card-${user.id}`">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600">
                    {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-medium text-neutral-900">{{ user.firstName }} {{ user.lastName }}</p>
                    <p class="text-xs text-neutral-500">{{ user.email }}</p>
                  </div>
                </div>
                <button
                  :data-testid="`delete-user-mobile-${user.id}`"
                  class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500"
                  :disabled="loading"
                  @click="handleDelete(user.id, `${user.firstName} ${user.lastName}`)"
                >
                  <Icon name="lucide:trash-2" size="1rem" />
                </button>
              </div>
              <div class="mt-2 flex items-center justify-between text-xs text-neutral-500">
                <span>{{ user.role ?? "—" }}</span>
                <span>{{ user.createdAt ?? "—" }}</span>
              </div>
            </div>
          </div>
        </div>
      </SGCard>
    </div>
  </div>
</template>
