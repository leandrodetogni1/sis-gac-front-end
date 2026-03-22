<script setup lang="ts">
import type { SGTableColumn } from "~/types/SGTableColumn";

useHead({ title: "Usuários — Configurações — SWGAC" });

const { users, fetched, loading, error, getUsers, deleteUser } = useUsers();
const { showToastSuccess } = useToastNotification();
const { confirmAlert } = useAlerts();

const openModal = ref(false);

const columns: SGTableColumn[] = [
  { key: "name", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "role", label: "Perfil" },
  { key: "createdAt", label: "Criado em" },
  { key: "actions", label: "Ações", align: "right" },
];

const handleCreated = async () => {
  openModal.value = false;
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
          variant="primary"
          icon="lucide:user-plus"
          @click="openModal = true"
        >
          Adicionar Usuário
        </SGButton>
      </div>

      <SGModal v-model:open="openModal" title="Adicionar Usuário" description="Preencha os dados do novo usuário">
        <config-user-form @created="handleCreated" />
      </SGModal>

      <SGCard test-id="card-users">
        <SGTable
          :columns="columns"
          :items="users"
          :error="error"
          error-text="Falha ao carregar usuários"
          empty-text="Nenhum usuário encontrado"
          empty-description="Comece adicionando o primeiro usuário."
          empty-icon="lucide:users"
          test-id="users-table"
          @retry="getUsers()"
        >
          <template #cell-name="{ item: user }">
            <div class="flex items-center gap-2.5">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600"
              >
                {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
              </div>
              <span class="font-medium text-neutral-900">{{ user.firstName }} {{ user.lastName }}</span>
            </div>
          </template>

          <template #cell-email="{ item: user }">
            <span class="text-neutral-500">{{ user.email }}</span>
          </template>

          <template #cell-role="{ item: user }">
            <span class="text-neutral-500">{{ user.role ?? "—" }}</span>
          </template>

          <template #cell-createdAt="{ item: user }">
            <span class="text-neutral-500">{{ user.createdAt ?? "—" }}</span>
          </template>

          <template #cell-actions="{ item: user }">
            <button
              :data-testid="`delete-user-${user.id}`"
              class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500"
              :disabled="loading"
              @click="handleDelete(user.id, `${user.firstName} ${user.lastName}`)"
            >
              <Icon name="lucide:trash-2" size="1rem" />
            </button>
          </template>

          <template #empty-action>
            <SGButton test-id="empty-state-add-button" variant="primary" icon="lucide:user-plus" size="sm" @click="openModal = true">
              Adicionar Usuário
            </SGButton>
          </template>

          <template #mobile="{ item: user }">
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
          </template>
        </SGTable>
      </SGCard>
    </div>
  </div>
</template>
