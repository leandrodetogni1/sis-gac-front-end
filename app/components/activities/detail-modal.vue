<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";

const props = withDefaults(
  defineProps<{
    activity: ActivityResponseDto | null;
    showUser?: boolean;
  }>(),
  { showUser: true },
);

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits(["approved", "verified", "rejected", "deleted", "edit", "note-updated"]);

const { user } = useAuthState();
const { approveActivity, verifyActivity, rejectActivity, deleteActivity, updateActivityNote } =
  useActivities();
const { showToastSuccess, showToastError } = useToastNotification();
const { confirmAlert, promptAlert } = useAlerts();

const actionLoading = ref(false);

const certificateFileUrl = computed(() =>
  props.activity?.id ? `/api/activities/${props.activity.id}/file` : undefined,
);

const isReviewer = computed(() => user.value?.role === "reviewer");
const isAdminOrOwner = computed(() => user.value?.role === "admin" || user.value?.role === "owner");
const isActivityAuthor = computed(
  () => !!props.activity?.authorId && props.activity.authorId === user.value?.id,
);
const canSeeEvents = computed(
  () => isReviewer.value || isAdminOrOwner.value || isActivityAuthor.value,
);

const label = computed(() => {
  if (!props.activity) return "—";
  return props.activity.activity_types?.label ?? props.activity.event ?? "—";
});

const userName = computed(() => {
  if (!props.activity?.users) return "—";
  return `${props.activity.users.firstName} ${props.activity.users.lastName}`;
});

const currentStatus = computed(() => props.activity?.status?.toLowerCase() ?? "pending");

const canVerify = computed(() => {
  if (!isAdminOrOwner.value && !isReviewer.value) return false;
  return currentStatus.value === "pending";
});

const canApprove = computed(() => {
  if (!isAdminOrOwner.value) return false;
  return currentStatus.value !== "approved";
});

const canReject = computed(() => {
  if (isAdminOrOwner.value) return currentStatus.value !== "rejected";
  if (isReviewer.value) return currentStatus.value === "pending";
  return false;
});

const canEdit = computed(() => {
  if (isAdminOrOwner.value) return true;
  const status = props.activity?.status?.toLowerCase();
  if (status !== "pending") return false;
  return isActivityAuthor.value || isReviewer.value;
});

const canDelete = computed(() => {
  const status = props.activity?.status?.toLowerCase();
  return status === "pending" && isActivityAuthor.value;
});

const canManageNote = computed(() => isAdminOrOwner.value || isReviewer.value);

const hasDecisionActions = computed(() => canReject.value || canVerify.value || canApprove.value);

const handleEdit = () => {
  if (!props.activity) return;
  open.value = false;
  emit("edit", props.activity);
};

const handleStudentOpen = () => {
  if (!props.activity?.users?.id) return;
  open.value = false;
  navigateTo(`/members/${props.activity.users.id}`);
};

const menuItems = computed<DropdownMenuItem[][]>(() => {
  const manage: DropdownMenuItem[] = [];
  if (canManageNote.value) {
    manage.push({
      label: props.activity?.note ? "Editar nota" : "Adicionar nota",
      icon: "lucide:sticky-note",
      onSelect: handleNote,
    });
  }
  if (canEdit.value) {
    manage.push({ label: "Editar atividade", icon: "lucide:pencil", onSelect: handleEdit });
  }
  const danger: DropdownMenuItem[] = [];
  if (canDelete.value) {
    danger.push({
      label: "Excluir atividade",
      icon: "lucide:trash-2",
      color: "error",
      onSelect: handleDelete,
    });
  }
  return [manage, danger].filter((group) => group.length > 0);
});

const hasMenuActions = computed(() => menuItems.value.length > 0);

const handleApprove = async () => {
  if (!props.activity) return;
  open.value = false;
  await nextTick();
  const confirmed = await confirmAlert(
    currentStatus.value === "rejected"
      ? `A atividade "${label.value}" foi rejeitada anteriormente e será aprovada.`
      : `A atividade "${label.value}" será aprovada.`,
    "Aprovar atividade?",
  );
  if (!confirmed) {
    open.value = true;
    return;
  }

  actionLoading.value = true;
  try {
    await approveActivity(props.activity.id);
    showToastSuccess("Atividade aprovada com sucesso");
    emit("approved");
  } catch {
    showToastError("Erro ao aprovar atividade");
    open.value = true;
  } finally {
    actionLoading.value = false;
  }
};

const handleVerify = async () => {
  if (!props.activity) return;
  open.value = false;
  await nextTick();
  const confirmed = await confirmAlert(
    `A atividade "${label.value}" será verificada e enviada para aprovação da comissão.`,
    "Verificar atividade?",
  );
  if (!confirmed) {
    open.value = true;
    return;
  }

  actionLoading.value = true;
  try {
    await verifyActivity(props.activity.id);
    showToastSuccess("Atividade verificada com sucesso");
    emit("verified");
  } catch {
    showToastError("Erro ao verificar atividade");
    open.value = true;
  } finally {
    actionLoading.value = false;
  }
};

const handleReject = async () => {
  if (!props.activity) return;
  open.value = false;
  await nextTick();
  const observation = await promptAlert(
    "Rejeitar atividade?",
    currentStatus.value === "approved"
      ? `A atividade "${label.value}" está aprovada e será rejeitada. Adicione uma observação para o aluno (opcional).`
      : `A atividade "${label.value}" será rejeitada. Adicione uma observação para o aluno (opcional).`,
    { placeholder: "Motivo da reprovação...", confirmText: "Rejeitar", icon: "warning" },
  );
  if (observation === null) {
    open.value = true;
    return;
  }

  actionLoading.value = true;
  try {
    await rejectActivity(props.activity.id, observation || undefined);
    showToastSuccess("Atividade rejeitada");
    emit("rejected");
  } catch {
    showToastError("Erro ao rejeitar atividade");
    open.value = true;
  } finally {
    actionLoading.value = false;
  }
};

const handleNote = async () => {
  if (!props.activity) return;
  const hadNote = !!props.activity.note;
  open.value = false;
  await nextTick();
  const note = await promptAlert(
    hadNote ? "Editar nota" : "Adicionar nota",
    `Escreva uma nota para o aluno sobre a atividade "${label.value}". Deixe em branco para remover a nota.`,
    {
      placeholder: "Ex.: certificado está errado, verifique...",
      confirmText: "Salvar",
      initialValue: props.activity.note ?? "",
    },
  );
  if (note === null) {
    open.value = true;
    return;
  }

  actionLoading.value = true;
  try {
    await updateActivityNote(props.activity.id, note || null);
    showToastSuccess(note ? "Nota salva com sucesso" : "Nota removida");
    emit("note-updated");
  } catch {
    showToastError("Erro ao salvar nota");
    open.value = true;
  } finally {
    actionLoading.value = false;
  }
};

const handleDelete = async () => {
  if (!props.activity) return;
  open.value = false;
  await nextTick();
  const confirmed = await confirmAlert(
    `A atividade "${label.value}" será excluída permanentemente.`,
    "Excluir atividade?",
    "warning",
  );
  if (!confirmed) {
    open.value = true;
    return;
  }

  actionLoading.value = true;
  try {
    await deleteActivity(props.activity.id);
    showToastSuccess("Atividade excluída");
    emit("deleted");
  } catch {
    showToastError("Erro ao excluir atividade");
    open.value = true;
  } finally {
    actionLoading.value = false;
  }
};
</script>

<template>
  <SGModal v-model:open="open" test-id="activity-detail-modal">
    <template #header>
      <div class="flex w-full items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Detalhes da Atividade</h2>
          <p class="mt-1 text-sm text-muted">Informações da atividade complementar</p>
        </div>
        <div class="flex items-center gap-1">
          <UDropdownMenu v-if="activity && hasMenuActions" :items="menuItems" :content="{ align: 'end' }">
            <button
              type="button"
              class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Mais ações"
              data-testid="activity-actions-menu"
              :disabled="actionLoading"
            >
              <Icon name="lucide:ellipsis-vertical" size="1.1rem" />
            </button>
          </UDropdownMenu>
          <button
            type="button"
            class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Fechar"
            data-testid="activity-detail-close"
            @click="open = false"
          >
            <Icon name="lucide:x" size="1.1rem" />
          </button>
        </div>
      </div>
    </template>

    <template #body>
      <div v-if="activity" class="space-y-4">
        <div class="flex items-center justify-between gap-2">
          <h3 class="text-base font-semibold text-highlighted">{{ label }}</h3>
          <div class="flex shrink-0 items-center gap-1.5">
            <activities-class-badge :activity-class="activity.class" test-id="activity-class-badge" />
            <SGBadge :status="activity.status || 'pending'" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <button
            v-if="showUser && activity.users"
            type="button"
            class="group col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-left transition-all duration-200 hover:border-primary-200 hover:bg-white hover:shadow-md hover:shadow-primary-500/10 active:scale-[0.99]"
            data-testid="activity-student-link"
            @click="handleStudentOpen"
          >
            <SGAvatar :first-name="activity.users.firstName" :last-name="activity.users.lastName" :picture="activity.users.picture" size="md" />
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Aluno</p>
              <p class="truncate text-sm font-semibold text-neutral-900">{{ userName }}</p>
            </div>
            <span class="flex shrink-0 items-center gap-1 text-xs font-medium text-neutral-400 transition-colors group-hover:text-primary-400">
              Ver aluno
              <Icon name="lucide:chevron-right" size="0.9rem" class="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </button>

          <div class="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-50 text-primary-400">
              <Icon name="lucide:flask-conical" size="1rem" />
            </span>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Categoria</p>
              <p class="truncate text-sm font-semibold text-neutral-900">{{ formatCategory(activity.activity_types?.category) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-success-50 text-success-600">
              <Icon name="lucide:clock" size="1rem" />
            </span>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Horas</p>
              <p class="truncate text-sm font-semibold text-neutral-900">
                {{ formatHours(activity.hoursEquivalent) }}
                <span v-if="activity.hours !== null" class="text-xs font-medium text-neutral-500">· informadas {{ formatHours(activity.hours) }}</span>
              </p>
            </div>
          </div>

          <div class="col-span-2 flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-50 text-primary-400">
              <Icon name="lucide:calendar" size="1rem" />
            </span>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Período</p>
              <p class="truncate text-sm font-semibold text-neutral-900">{{ formatDateBR(activity.startDate) }} até {{ formatDateBR(activity.endDate) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-50 text-primary-400">
              <Icon name="lucide:building-2" size="1rem" />
            </span>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Organização</p>
              <p class="truncate text-sm font-semibold text-neutral-900">{{ activity.organization ?? "—" }}</p>
            </div>
          </div>

          <a
            v-if="activity.file && certificateFileUrl"
            :href="certificateFileUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 transition-transform duration-150 active:scale-[0.98]"
            data-testid="certificate-file-button"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-error-50 text-error-600">
              <Icon name="lucide:file-text" size="1rem" />
            </span>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Certificado</p>
              <p class="truncate text-sm font-semibold text-primary-400">Ver certificado</p>
            </div>
          </a>

          <div v-else class="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-neutral-100 text-neutral-400">
              <Icon name="lucide:file-text" size="1rem" />
            </span>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Certificado</p>
              <p class="truncate text-sm font-semibold text-neutral-500">—</p>
            </div>
          </div>

          <a
            v-if="activity.certificateUrl"
            :href="activity.certificateUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 transition-transform duration-150 active:scale-[0.98]"
            data-testid="certificate-link"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-50 text-primary-400">
              <Icon name="lucide:external-link" size="1rem" />
            </span>
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Link</p>
              <p class="truncate text-sm font-semibold text-primary-400">Abrir link do certificado</p>
            </div>
          </a>
        </div>

        <div
          v-if="activity.note"
          class="rounded-md border border-[#F59E0B]/35 bg-[#F59E0B]/10 p-3"
          data-testid="activity-note-box"
        >
          <div class="flex items-center gap-1.5">
            <Icon name="lucide:sticky-note" size="0.95rem" class="text-[#B45309]" />
            <p class="text-xs font-medium uppercase text-[#B45309]">Nota do professor</p>
          </div>
          <p class="mt-1 whitespace-pre-line text-sm text-highlighted">{{ activity.note }}</p>
          <p v-if="activity.noteUpdatedAt" class="mt-1 text-xs text-muted">
            Atualizada em {{ formatDateBR(activity.noteUpdatedAt) }}
          </p>
        </div>

        <template v-if="canSeeEvents">
          <USeparator />
          <activities-events-timeline :activity-id="activity.id" />
        </template>
      </div>
    </template>

    <template v-if="hasDecisionActions" #footer>
      <div class="flex w-full flex-wrap items-center justify-end gap-2">
        <span v-show="canReject">
          <SGButton
            test-id="reject-activity-button"
            variant="danger"
            icon="lucide:circle-x"
            size="sm"
            :disabled="actionLoading"
            @click="handleReject"
          >
            Rejeitar
          </SGButton>
        </span>
        <span v-show="canVerify">
          <SGButton
            test-id="verify-activity-button"
            variant="primary"
            icon="lucide:search-check"
            size="sm"
            :disabled="actionLoading"
            @click="handleVerify"
          >
            Verificar
          </SGButton>
        </span>
        <span v-show="canApprove">
          <SGButton
            test-id="approve-activity-button"
            variant="success"
            icon="lucide:circle-check"
            size="sm"
            :disabled="actionLoading"
            @click="handleApprove"
          >
            Aprovar
          </SGButton>
        </span>
      </div>
    </template>
  </SGModal>
</template>
