<script setup lang="ts">
import type { SGTableColumn } from "~/types/SGTableColumn";
import type { UserResponseDto } from "~/interfaces/UserResponseDto";

useHead({ title: "Alunos — SWGAC" });

const { user } = useAuthState();

if (user.value && user.value.role !== "admin" && user.value.role !== "owner") {
  await navigateTo("/");
}

const { users, fetched, error, getUsers } = useUsers();

const search = ref("");

const columns: SGTableColumn[] = [
  { key: "name", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "matricula", label: "Matrícula" },
  { key: "course", label: "Curso" },
  { key: "createdAt", label: "Cadastrado em" },
];

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return users.value;
  return users.value.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(term) || u.email.toLowerCase().includes(term);
  });
});

const handleRowClick = (member: UserResponseDto) => {
  navigateTo(`/members/${member.id}`);
};

onMounted(async () => {
  await getUsers({ role: "member" });
});
</script>

<template>
  <div>
    <div v-if="!fetched" class="flex min-h-[40vh] items-center justify-center" data-testid="page-loading">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        <p class="text-sm text-neutral-500">Carregando alunos...</p>
      </div>
    </div>

    <div v-else>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-neutral-900 md:text-lg">Alunos</h2>
      </div>

      <div class="mb-4 w-full sm:max-w-sm">
        <SGInput
          v-model="search"
          placeholder="Buscar por nome ou email"
          test-id="search-alunos"
        />
      </div>

      <SGCard test-id="card-alunos">
        <SGTable
          :columns="columns"
          :items="filteredUsers"
          :error="error"
          error-text="Falha ao carregar alunos"
          empty-text="Nenhum aluno encontrado"
          empty-description="Não há alunos cadastrados ainda."
          empty-icon="lucide:graduation-cap"
          test-id="alunos-table"
          clickable
          @retry="getUsers({ role: 'member' })"
          @row-click="handleRowClick"
        >
          <template #cell-name="{ item: member }">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600">
                {{ member.firstName.charAt(0) }}{{ member.lastName.charAt(0) }}
              </div>
              <span class="font-medium text-neutral-900">{{ member.firstName }} {{ member.lastName }}</span>
            </div>
          </template>

          <template #cell-email="{ item: member }">
            <span class="text-neutral-500">{{ member.email }}</span>
          </template>

          <template #cell-matricula="{ item: member }">
            <span class="text-neutral-500">{{ member.matricula ?? "—" }}</span>
          </template>

          <template #cell-course="{ item: member }">
            <span class="text-neutral-500">{{ member.course ?? "—" }}</span>
          </template>

          <template #cell-createdAt="{ item: member }">
            <span class="text-neutral-500">{{ formatDateTimeBR(member.createdAt) }}</span>
          </template>

          <template #mobile="{ item: member }">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600">
                  {{ member.firstName.charAt(0) }}{{ member.lastName.charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-neutral-900">{{ member.firstName }} {{ member.lastName }}</p>
                  <p class="text-xs text-neutral-500">{{ member.email }}</p>
                </div>
              </div>
              <Icon name="lucide:chevron-right" size="1.125rem" class="text-neutral-400" />
            </div>
            <div class="mt-2 flex items-center justify-between text-xs text-neutral-500">
              <span>{{ member.matricula ?? "—" }} · {{ member.course ?? "—" }}</span>
              <span>{{ formatDateTimeBR(member.createdAt) }}</span>
            </div>
          </template>
        </SGTable>
      </SGCard>
    </div>
  </div>
</template>
