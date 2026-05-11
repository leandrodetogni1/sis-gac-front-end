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

const emit = defineEmits(["approved", "verified", "rejected", "edit"]);

const { user } = useAuthState();
const { approveActivity, verifyActivity, rejectActivity } = useActivities();
const { showToastSuccess, showToastError } = useToastNotification();
const { confirmAlert } = useAlerts();

const actionLoading = ref(false);

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

const canVerify = computed(() => {
  if (!isReviewer.value) return false;
  const status = props.activity?.status?.toLowerCase();
  return status === "pending" || status === undefined || status === null;
});

const canApprove = computed(() => {
  if (!isAdminOrOwner.value) return false;
  const status = props.activity?.status?.toLowerCase();
  return status === "pending" || status === "verified" || status === undefined || status === null;
});

const canReject = computed(() => canVerify.value || canApprove.value);

const canEdit = computed(() => {
  const status = props.activity?.status?.toLowerCase();
  if (status !== "pending") return false;
  return isActivityAuthor.value || isReviewer.value || isAdminOrOwner.value;
});

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
    `A atividade "${label.value}" será aprovada.`,
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
    `A atividade "${label.value}" será verificada e enviada para aprovação da coordenação.`,
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
  const confirmed = await confirmAlert(
    `A atividade "${label.value}" será rejeitada.`,
    "Rejeitar atividade?",
    "warning",
  );
  if (!confirmed) {
    open.value = true;
    return;
  }

  actionLoading.value = true;
  try {
    await rejectActivity(props.activity.id);
    showToastSuccess("Atividade rejeitada");
    emit("rejected");
  } catch {
    showToastError("Erro ao rejeitar atividade");
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
            <p class="mt-0.5 text-highlighted">{{ activity.activity_types?.category ?? "—" }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Horas reconhecidas</p>
            <p class="mt-0.5 text-highlighted">{{ activity.hoursEquivalent ?? 0 }}h</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Horas informadas</p>
            <p class="mt-0.5 text-highlighted">{{ activity.hours ?? "—" }}<span v-if="activity.hours !== null">h</span></p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Organização</p>
            <p class="mt-0.5 text-highlighted">{{ activity.organization ?? "—" }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Data Início</p>
            <p class="mt-0.5 text-highlighted">{{ formatDateTimeBR(activity.startDate) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Data Fim</p>
            <p class="mt-0.5 text-highlighted">{{ formatDateTimeBR(activity.endDate) }}</p>
          </div>
          <div v-if="showUser">
            <p class="text-xs font-medium uppercase text-muted">Aluno</p>
            <p class="mt-0.5 text-highlighted">{{ userName }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-muted">Certificado</p>
            <a
              v-if="activity.certificateUrl"
              :href="activity.certificateUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-0.5 inline-flex items-center gap-1 text-primary hover:underline"
              data-testid="certificate-link"
            >
              <Icon name="lucide:external-link" size="0.875rem" />
              Abrir link
            </a>
            <p v-else class="mt-0.5 text-muted">—</p>
          </div>
        </div>

        <template v-if="canSeeEvents">
          <USeparator />
          <activities-events-timeline :activity-id="activity.id" />
        </template>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
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
        <span v-show="canReject">
          <SGButton
            test-id="reject-activity-button"
            variant="danger"
            icon="lucide:x"
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
            icon="lucide:check"
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
            variant="primary"
            icon="lucide:check"
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
