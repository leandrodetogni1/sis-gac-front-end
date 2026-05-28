<script setup lang="ts">
import type { SGTableColumn } from "~/types/SGTableColumn";

useHead({ title: "Usuários — Configurações — SWGAC" });

const { users, fetched, loading, error, getUsers, deleteUser } = useUsers();
const {
  invitations,
  fetched: invitationsFetched,
  loading: invitationsLoading,
  error: invitationsError,
  getInvitations,
  deleteInvitation,
} = useInvitations();
const { showToastSuccess } = useToastNotification();
const { confirmAlert } = useAlerts();

const openInvitationModal = ref(false);

const staffRoles = new Set(["owner", "admin", "reviewer"]);

const staffUsers = computed(() =>
  users.value.filter((u) => u.role && staffRoles.has(u.role.toLowerCase())),
);

type StaffRow = {
  rowKey: string;
  kind: "user" | "invitation";
  id: string;
  email: string;
  role: string | null;
  firstName: string | null;
  lastName: string | null;
  picture: string | null;
  inviterEmail: string | null;
  createdAt: string | null;
  isOwner: boolean;
};

const staffRows = computed<StaffRow[]>(() => {
  const fromUsers: StaffRow[] = staffUsers.value.map((u) => ({
    rowKey: `user:${u.id}`,
    kind: "user",
    id: u.id,
    email: u.email,
    role: u.role,
    firstName: u.firstName,
    lastName: u.lastName,
    picture: u.picture,
    inviterEmail: null,
    createdAt: u.createdAt,
    isOwner: u.role?.toLowerCase() === "owner",
  }));

  const fromInvitations: StaffRow[] = invitations.value.map((i) => ({
    rowKey: `invitation:${i.id}`,
    kind: "invitation",
    id: i.id,
    email: i.email,
    role: i.role,
    firstName: null,
    lastName: null,
    picture: null,
    inviterEmail: i.inviter?.email ?? null,
    createdAt: i.createdAt,
    isOwner: false,
  }));

  const ROLE_ORDER: Record<string, number> = { owner: 0, admin: 1, reviewer: 2 };
  const roleRank = (role: string | null) =>
    role && ROLE_ORDER[role.toLowerCase()] !== undefined ? ROLE_ORDER[role.toLowerCase()]! : 99;

  return [...fromUsers, ...fromInvitations].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "invitation" ? 1 : -1;
    const ra = roleRank(a.role);
    const rb = roleRank(b.role);
    if (ra !== rb) return ra - rb;
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
});

const roleLabel = (role: string | null) => {
  if (!role) return "—";
  const r = role.toLowerCase();
  if (r === "owner") return "Owner";
  if (r === "admin") return "Admin";
  if (r === "reviewer") return "Reviewer";
  if (r === "member") return "Aluno";
  return role;
};

const staffColumns: SGTableColumn[] = [
  { key: "name", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "role", label: "Perfil" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Criado em" },
  { key: "actions", label: "Ações", align: "right" },
];

const handleInvitationCreated = async () => {
  openInvitationModal.value = false;
  showToastSuccess("Convite enviado com sucesso");
  await getInvitations();
};

const handleRevoke = async (id: string, email: string) => {
  const confirmed = await confirmAlert(
    `O convite enviado para "${email}" será revogado.`,
    "Revogar convite?",
    "warning",
  );
  if (!confirmed) return;

  try {
    await deleteInvitation(id);
    showToastSuccess("Convite revogado com sucesso");
  } catch {
    // error handled by composable
  }
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
  await Promise.all([getUsers(), getInvitations()]);
});
</script>

<template>
  <div>
    <div
      v-if="!fetched || !invitationsFetched"
      class="flex min-h-[40vh] items-center justify-center"
      data-testid="page-loading"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando usuários...</p>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Usuários</h2>
        <SGButton
          test-id="toggle-invitation-form-button"
          variant="primary"
          icon="lucide:user-plus"
          @click="openInvitationModal = true"
        >
          Convidar admin/reviewer
        </SGButton>
      </div>

      <SGModal
        v-model:open="openInvitationModal"
        title="Convidar admin/reviewer"
        description="Envie um convite para que um novo usuário entre como Admin ou Reviewer."
      >
        <invitations-form @created="handleInvitationCreated" />
      </SGModal>

      <SGCard test-id="card-staff">
          <SGTable
            :columns="staffColumns"
            :items="staffRows"
            item-key="rowKey"
            :error="error ?? invitationsError"
            error-text="Falha ao carregar administradores"
            empty-text="Nenhum administrador cadastrado"
            empty-description="Convide um admin ou reviewer para começar."
            empty-icon="lucide:shield"
            test-id="staff-table"
            @retry="getUsers(); getInvitations()"
          >
            <template #cell-name="{ item: row }">
              <div v-if="row.kind === 'user'" class="flex items-center gap-2.5">
                <SGAvatar
                  :first-name="row.firstName"
                  :last-name="row.lastName"
                  :picture="row.picture"
                  size="sm"
                />
                <span class="font-medium text-neutral-900">{{ row.firstName }} {{ row.lastName }}</span>
              </div>
              <div v-else class="flex items-center gap-2.5">
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400"
                >
                  <Icon name="lucide:mail" size="1rem" />
                </div>
                <span class="text-neutral-400 italic">Aguardando 1º acesso</span>
              </div>
            </template>

            <template #cell-email="{ item: row }">
              <div class="flex flex-col">
                <span class="text-neutral-700">{{ row.email }}</span>
                <span v-if="row.kind === 'invitation' && row.inviterEmail" class="text-xs text-neutral-400">
                  convidado por {{ row.inviterEmail }}
                </span>
              </div>
            </template>

            <template #cell-role="{ item: row }">
              <span class="text-neutral-500">{{ roleLabel(row.role) }}</span>
            </template>

            <template #cell-status="{ item: row }">
              <span
                v-if="row.kind === 'invitation'"
                class="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Pendente
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ativo
              </span>
            </template>

            <template #cell-createdAt="{ item: row }">
              <span class="text-neutral-500">{{ formatDateTimeBR(row.createdAt) }}</span>
            </template>

            <template #cell-actions="{ item: row }">
              <button
                v-if="row.kind === 'user'"
                :data-testid="`delete-user-${row.id}`"
                class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-400"
                :disabled="loading || row.isOwner"
                :title="row.isOwner ? 'Não é possível remover o owner' : 'Remover usuário'"
                @click="handleDelete(row.id, `${row.firstName} ${row.lastName}`)"
              >
                <Icon name="lucide:trash-2" size="1rem" />
              </button>
              <button
                v-else
                :data-testid="`revoke-invitation-${row.id}`"
                class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500"
                :disabled="invitationsLoading"
                title="Revogar convite"
                @click="handleRevoke(row.id, row.email)"
              >
                <Icon name="lucide:trash-2" size="1rem" />
              </button>
            </template>

            <template #empty-action>
              <SGButton
                test-id="empty-state-add-staff-button"
                variant="primary"
                icon="lucide:user-plus"
                size="sm"
                @click="openInvitationModal = true"
              >
                Convidar admin/reviewer
              </SGButton>
            </template>

            <template #mobile="{ item: row }">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <SGAvatar
                    v-if="row.kind === 'user'"
                    :first-name="row.firstName"
                    :last-name="row.lastName"
                    :picture="row.picture"
                    size="sm"
                  />
                  <div
                    v-else
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400"
                  >
                    <Icon name="lucide:mail" size="1rem" />
                  </div>
                  <div>
                    <p v-if="row.kind === 'user'" class="font-medium text-neutral-900">
                      {{ row.firstName }} {{ row.lastName }}
                    </p>
                    <p v-else class="text-sm italic text-neutral-400">Aguardando 1º acesso</p>
                    <p class="text-xs text-neutral-500">{{ row.email }}</p>
                  </div>
                </div>
                <button
                  v-if="row.kind === 'user'"
                  :data-testid="`delete-user-mobile-${row.id}`"
                  class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500 disabled:opacity-40"
                  :disabled="loading || row.isOwner"
                  @click="handleDelete(row.id, `${row.firstName} ${row.lastName}`)"
                >
                  <Icon name="lucide:trash-2" size="1rem" />
                </button>
                <button
                  v-else
                  :data-testid="`revoke-invitation-mobile-${row.id}`"
                  class="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-500"
                  :disabled="invitationsLoading"
                  @click="handleRevoke(row.id, row.email)"
                >
                  <Icon name="lucide:trash-2" size="1rem" />
                </button>
              </div>
              <div class="mt-2 flex items-center justify-between text-xs text-neutral-500">
                <span class="flex items-center gap-2">
                  {{ roleLabel(row.role) }}
                  <span
                    v-if="row.kind === 'invitation'"
                    class="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                  >
                    <span class="h-1 w-1 rounded-full bg-amber-500" />
                    Pendente
                  </span>
                </span>
                <span>{{ formatDateTimeBR(row.createdAt) }}</span>
              </div>
            </template>
          </SGTable>
        </SGCard>
    </div>
  </div>
</template>
