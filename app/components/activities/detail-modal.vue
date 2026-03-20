<script setup lang="ts">
import type { ActivityResponseDto } from "~/interfaces/ActivityResponseDto";

const props = defineProps<{
  activity: ActivityResponseDto | null;
}>();

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits(["approved", "rejected"]);

const { approveActivity, rejectActivity } = useActivities();
const { showToastSuccess, showToastError } = useToastNotification();
const { confirmAlert } = useAlerts();

const actionLoading = ref(false);

const label = computed(() => {
  if (!props.activity) return "—";
  return props.activity.activity_types?.label ?? props.activity.event ?? "—";
});

const userName = computed(() => {
  if (!props.activity?.users) return "—";
  return `${props.activity.users.firstName} ${props.activity.users.lastName}`;
});

const isPending = computed(() => {
  const status = props.activity?.status?.toLowerCase();
  return status === "pending" || status === undefined || status === null;
});

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
          <h3 class="text-base font-semibold text-neutral-900">{{ label }}</h3>
          <SGBadge :status="activity.status || 'pending'" />
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-xs font-medium uppercase text-neutral-500">Categoria</p>
            <p class="mt-0.5 text-neutral-900">{{ activity.category ?? "—" }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-neutral-500">Horas</p>
            <p class="mt-0.5 text-neutral-900">{{ activity.hours ?? 0 }}h</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-neutral-500">Data Início</p>
            <p class="mt-0.5 text-neutral-900">{{ activity.startDate ?? "—" }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-neutral-500">Data Fim</p>
            <p class="mt-0.5 text-neutral-900">{{ activity.endDate ?? "—" }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-neutral-500">Aluno</p>
            <p class="mt-0.5 text-neutral-900">{{ userName }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-neutral-500">Organização</p>
            <p class="mt-0.5 text-neutral-900">{{ activity.organization ?? "—" }}</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <span v-show="isPending">
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
        <span v-show="isPending">
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
