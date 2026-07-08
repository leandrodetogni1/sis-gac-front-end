<script setup lang="ts">
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
  const status = props.activity?.status?.toLowerCase();
  if (status !== "pending") return false;
  return isActivityAuthor.value || isReviewer.value || isAdminOrOwner.value;
});

const canDelete = computed(() => {
  const status = props.activity?.status?.toLowerCase();
  return status === "pending" && isActivityAuthor.value;
});

const canManageNote = computed(() => isAdminOrOwner.value || isReviewer.value);

const handleEdit = () => {
  if (!props.activity) return;
  open.value = false;
  emit("edit", props.activity);
};

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
  <SGModal v-model:open="open" title="Detalhes da Atividade" description="Informações da atividade complementar" test-id="activity-detail-modal">
    <template #body>
      <div v-if="activity" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-highlighted">{{ label }}</h3>
          <SGBadge :status="activity.status || 'pending'" />
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-xs font-medium uppercase text-muted">Categoria</p>
            <p class="mt-0.5 text-highlighted">{{ formatCategory(activity.activity_types?.category) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Horas reconhecidas</p>
            <p class="mt-0.5 text-highlighted">{{ formatHours(activity.hoursEquivalent) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Horas informadas</p>
            <p class="mt-0.5 text-highlighted">{{ activity.hours !== null ? formatHours(activity.hours) : "—" }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Organização</p>
            <p class="mt-0.5 text-highlighted">{{ activity.organization ?? "—" }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Data Início</p>
            <p class="mt-0.5 text-highlighted">{{ formatDateBR(activity.startDate) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Data Fim</p>
            <p class="mt-0.5 text-highlighted">{{ formatDateBR(activity.endDate) }}</p>
          </div>
          <div v-if="showUser">
            <p class="text-xs font-medium uppercase text-muted">Aluno</p>
            <p class="mt-0.5 text-highlighted">{{ userName }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Certificado</p>

            <div v-if="activity.file && certificateFileUrl" class="mt-1">
              <a
                :href="certificateFileUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex w-fit items-center gap-1.5 rounded-md border border-default bg-elevated px-2.5 py-1.5 text-sm text-highlighted transition-colors hover:border-primary-300 hover:text-primary"
                data-testid="certificate-file-button"
              >
                <Icon name="lucide:file-text" size="0.95rem" />
                Ver certificado
              </a>
            </div>

            <p v-else class="mt-0.5 text-muted">—</p>
          </div>

          <div>
            <p class="text-xs font-medium uppercase text-muted">Link</p>

            <a
              v-if="activity.certificateUrl"
              :href="activity.certificateUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              data-testid="certificate-link"
            >
              <Icon name="lucide:external-link" size="0.875rem" />
              Abrir link
            </a>

            <p v-else class="mt-0.5 text-muted">—</p>
          </div>
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

    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <span v-show="canManageNote">
            <SGButton
              test-id="note-activity-button"
              variant="ghost"
              icon="lucide:sticky-note"
              size="sm"
              :disabled="actionLoading"
              @click="handleNote"
            >
              {{ activity?.note ? "Editar nota" : "Adicionar nota" }}
            </SGButton>
          </span>
          <span v-show="canEdit">
            <SGButton
              test-id="edit-activity-button"
              variant="secondary"
              icon="lucide:pencil"
              size="sm"
              :disabled="actionLoading"
              @click="handleEdit"
            >
              Editar
            </SGButton>
          </span>
          <span v-show="canDelete">
            <SGButton
              test-id="delete-activity-button"
              variant="danger"
              icon="lucide:trash-2"
              size="sm"
              :disabled="actionLoading"
              @click="handleDelete"
            >
              Excluir
            </SGButton>
          </span>
        </div>
        <div class="ml-auto flex flex-wrap items-center gap-2">
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
      </div>
    </template>
  </SGModal>
</template>
