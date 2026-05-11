<script setup lang="ts">
import type { ActivityEventResponseDto } from "~/interfaces/ActivityEventResponseDto";
import type { ActivityStatus } from "~/interfaces/ActivityResponseDto";

const props = defineProps<{
  activityId: string | null;
}>();

const { getActivityEvents } = useActivities();

const events = ref<ActivityEventResponseDto[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchEvents = async () => {
  if (!props.activityId) {
    events.value = [];
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    events.value = await getActivityEvents(props.activityId);
  } catch (e: any) {
    error.value = e?.data?.message ?? "Não foi possível carregar o histórico";
    events.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.activityId, fetchEvents, { immediate: true });

const STATUS_LABELS: Record<ActivityStatus, string> = {
  PENDING: "Marcada como pendente",
  VERIFIED: "Verificada",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
};

const isStatusChange = (event: ActivityEventResponseDto): boolean => {
  return event.fromStatus !== event.toStatus;
};

const eventLabel = (event: ActivityEventResponseDto): string => {
  if (event.fromStatus === null) return "Atividade criada";
  if (!isStatusChange(event) && event.comment) return event.comment;
  return STATUS_LABELS[event.toStatus] ?? `Status: ${event.toStatus}`;
};

const dotClass = (status: ActivityStatus): string => {
  switch (status) {
    case "APPROVED":
      return "bg-success-500";
    case "REJECTED":
      return "bg-error-500";
    case "VERIFIED":
      return "bg-primary-500";
    case "PENDING":
      return "bg-warning-500";
    default:
      return "bg-accented";
  }
};
</script>

<template>
  <div data-testid="events-timeline">
    <h4 class="text-xs font-medium uppercase text-muted">Histórico</h4>

    <p v-if="loading" class="mt-3 text-sm text-muted" data-testid="events-loading">
      Carregando histórico...
    </p>
    <p v-else-if="error" class="mt-3 text-sm text-error-500" data-testid="events-error">
      {{ error }}
    </p>
    <p v-else-if="events.length === 0" class="mt-3 text-sm text-muted" data-testid="events-empty">
      Nenhum evento registrado.
    </p>

    <ol v-else class="mt-4 space-y-5">
      <li v-for="(event, index) in events" :key="event.id" class="flex gap-3.5">
        <div class="flex flex-col items-center">
          <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" :class="dotClass(event.toStatus)" />
          <span v-if="index < events.length - 1" class="mt-2 w-px flex-1 bg-accented" />
        </div>
        <div class="flex-1 pb-1">
          <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p class="text-sm font-medium text-highlighted">{{ eventLabel(event) }}</p>
            <time
              class="shrink-0 text-xs tabular-nums text-muted"
              :datetime="event.createdAt"
            >
              {{ formatDateTimeBR(event.createdAt) }}
            </time>
          </div>
          <div
            v-if="event.actor"
            class="mt-1 flex items-center gap-1.5 text-xs text-toned"
            :title="event.actor.email"
          >
            <SGAvatar
              :first-name="event.actor.firstName"
              :last-name="event.actor.lastName"
              :picture="event.actor.picture"
              size="xs"
            />
            <span>{{ event.actor.firstName }} {{ event.actor.lastName }}</span>
          </div>
          <p
            v-if="event.comment && isStatusChange(event)"
            class="mt-2 border-l-2 border-accented pl-3 text-xs italic text-toned"
          >
            {{ event.comment }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>
