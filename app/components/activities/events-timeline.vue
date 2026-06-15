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
      return "bg-[#16A34A]";
    case "REJECTED":
      return "bg-[#DC2626]";
    case "VERIFIED":
      return "bg-[#2563EB]";
    case "PENDING":
      return "bg-[#F59E0B]";
    default:
      return "bg-neutral-400";
  }
};

const haloClass = (status: ActivityStatus): string => {
  switch (status) {
    case "APPROVED":
      return "bg-[#16A34A]/15";
    case "REJECTED":
      return "bg-[#DC2626]/15";
    case "VERIFIED":
      return "bg-[#2563EB]/15";
    case "PENDING":
      return "bg-[#F59E0B]/15";
    default:
      return "bg-neutral-400/15";
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

    <ol v-else class="relative mt-5">
      <li v-for="(event, index) in events" :key="event.id" class="relative flex gap-3.5 pb-6 last:pb-0">
        <span
          v-if="index < events.length - 1"
          class="absolute left-[7.5px] top-5 -bottom-2.5 w-px bg-accented"
          aria-hidden="true"
        />
        <div class="flex flex-col items-center">
          <span class="relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full" :class="haloClass(event.toStatus)">
            <span class="h-1.5 w-1.5 rounded-full" :class="dotClass(event.toStatus)" />
          </span>
        </div>
        <div class="min-w-0 flex-1">
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
            class="mt-1.5 flex items-center gap-1.5 text-xs text-toned"
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
            class="mt-2 rounded-r-md border-l-2 border-accented bg-elevated px-3 py-2 text-xs italic text-toned"
          >
            {{ event.comment }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>
