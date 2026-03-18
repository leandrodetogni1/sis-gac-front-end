export interface ActivityUser {
  name: string;
  avatar?: string;
}

export type ActivityType = "complementar" | "livre";
export type ActivityStatus = "pending" | "approved" | "rejected";

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  hours: number;
  date: string;
  status: ActivityStatus;
  user: ActivityUser;
}

export type CreateActivityPayload = Omit<Activity, "id" | "status">;

const mockActivities: Activity[] = [
  {
    id: "act-001",
    title: "Monitoria de Algoritmos",
    type: "complementar",
    hours: 40,
    date: "2026-03-01",
    status: "approved",
    user: { name: "Ana Silva", avatar: undefined },
  },
  {
    id: "act-002",
    title: "Semana Acadêmica 2026",
    type: "complementar",
    hours: 20,
    date: "2026-02-15",
    status: "approved",
    user: { name: "Carlos Souza" },
  },
  {
    id: "act-003",
    title: "Projeto de Extensão Comunitária",
    type: "complementar",
    hours: 60,
    date: "2026-01-20",
    status: "pending",
    user: { name: "Beatriz Lima" },
  },
  {
    id: "act-004",
    title: "Artigo Publicado em Conferência",
    type: "complementar",
    hours: 30,
    date: "2025-12-10",
    status: "approved",
    user: { name: "Ana Silva" },
  },
  {
    id: "act-005",
    title: "Curso de Liderança Online",
    type: "livre",
    hours: 10,
    date: "2026-02-28",
    status: "rejected",
    user: { name: "Diego Ramos" },
  },
  {
    id: "act-006",
    title: "Hackathon UFPel 2026",
    type: "livre",
    hours: 15,
    date: "2026-03-10",
    status: "pending",
    user: { name: "Fernanda Costa" },
  },
  {
    id: "act-007",
    title: "Estágio Voluntário em ONG",
    type: "complementar",
    hours: 80,
    date: "2025-11-05",
    status: "approved",
    user: { name: "Gabriel Oliveira" },
  },
  {
    id: "act-008",
    title: "Palestra sobre IA Generativa",
    type: "livre",
    hours: 4,
    date: "2026-03-12",
    status: "pending",
    user: { name: "Carlos Souza" },
  },
  {
    id: "act-009",
    title: "Workshop de Design Thinking",
    type: "livre",
    hours: 8,
    date: "2026-01-15",
    status: "approved",
    user: { name: "Beatriz Lima" },
  },
  {
    id: "act-010",
    title: "Iniciação Científica — Machine Learning",
    type: "complementar",
    hours: 120,
    date: "2025-10-01",
    status: "pending",
    user: { name: "Helena Martins" },
  },
  {
    id: "act-011",
    title: "Representação Estudantil no Conselho",
    type: "complementar",
    hours: 25,
    date: "2026-02-01",
    status: "rejected",
    user: { name: "Diego Ramos" },
  },
  {
    id: "act-012",
    title: "Curso de Excel Avançado",
    type: "livre",
    hours: 12,
    date: "2026-03-05",
    status: "approved",
    user: { name: "Fernanda Costa" },
  },
];

function delay(ms = 700): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let nextId = mockActivities.length + 1;

export const useActivities = () => {
  const activities = ref<Activity[]>([]);
  const loading = ref(false);
  const fetched = ref(false);

  const getActivities = async (): Promise<Activity[]> => {
    loading.value = true;
    await delay();
    activities.value = [...mockActivities];
    loading.value = false;
    fetched.value = true;
    return activities.value;
  };

  const getActivityById = async (id: string): Promise<Activity | undefined> => {
    loading.value = true;
    await delay(500);
    const activity = activities.value.find((a) => a.id === id);
    loading.value = false;
    return activity;
  };

  const createActivity = async (payload: CreateActivityPayload): Promise<Activity> => {
    loading.value = true;
    await delay(800);
    const newActivity: Activity = {
      ...payload,
      id: `act-${String(nextId++).padStart(3, "0")}`,
      status: "pending",
    };
    activities.value = [newActivity, ...activities.value];
    loading.value = false;
    return newActivity;
  };

  const approveActivity = async (id: string): Promise<void> => {
    loading.value = true;
    await delay(600);
    activities.value = activities.value.map((a) => {
      return a.id === id ? { ...a, status: "approved" as const } : a;
    });
    loading.value = false;
  };

  const rejectActivity = async (id: string): Promise<void> => {
    loading.value = true;
    await delay(600);
    activities.value = activities.value.map((a) => {
      return a.id === id ? { ...a, status: "rejected" as const } : a;
    });
    loading.value = false;
  };

  const filterByStatus = (status: ActivityStatus): Activity[] => {
    return activities.value.filter((a) => a.status === status);
  };

  const filterByType = (type: ActivityType): Activity[] => {
    return activities.value.filter((a) => a.type === type);
  };

  return {
    activities,
    loading,
    fetched,
    getActivities,
    getActivityById,
    createActivity,
    approveActivity,
    rejectActivity,
    filterByStatus,
    filterByType,
  };
};
