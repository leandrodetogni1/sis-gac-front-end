<script setup lang="ts">
import { Course, CourseLabels } from "~/enums/Course";

definePageMeta({ layout: false });
useHead({ title: "Bem-vindo — SWGAC" });

const { user, setUser } = useAuthState();
const { patchUser, loading, error } = useUsers();

const matricula = ref<string>("");
const course = ref<Course | undefined>();

const courseOptions = Object.values(Course).map((value) => ({
  label: CourseLabels[value],
  value,
}));

const isValid = computed(() => {
  const mat = matricula.value.trim();
  return /^\d{8}$/.test(mat) && Boolean(course.value);
});

const submit = async () => {
  if (!isValid.value || !user.value) return;
  const updated = await patchUser(user.value.id, {
    matricula: Number(matricula.value),
    course: course.value!,
  });
  setUser({ ...user.value, ...updated });
  await navigateTo("/");
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
    <div class="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div class="mb-8 flex justify-center">
        <img src="/logo.png" alt="SWGAC" class="h-12" />
      </div>

      <h1 class="text-center text-xl font-bold text-neutral-900">Complete seu cadastro</h1>
      <p class="mt-2 text-center text-sm text-neutral-500">
        Olá, {{ user?.firstName }}! Precisamos de mais algumas informações para continuar.
      </p>

      <form class="mt-8 space-y-5" @submit.prevent="submit">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-neutral-700">Número de matrícula</label>
          <SGInput
            v-model="matricula"
            placeholder="Ex: 12345678"
            type="text"
            inputmode="numeric"
            maxlength="8"
          />
          <p v-if="matricula.length > 0 && !/^\d{8}$/.test(matricula)" class="text-xs text-red-500">
            A matrícula deve conter exatamente 8 dígitos numéricos.
          </p>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-neutral-700">Curso</label>
          <SGSelect v-model="course" placeholder="Selecione seu curso" :options="courseOptions" />
        </div>

        <p v-if="error" class="text-center text-sm text-red-500">{{ error }}</p>

        <SGButton type="submit" variant="primary" size="lg" block :loading="loading" :disabled="!isValid">
          Concluir cadastro
        </SGButton>
      </form>
    </div>
  </div>
</template>
