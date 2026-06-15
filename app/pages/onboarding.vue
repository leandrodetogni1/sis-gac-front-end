<script setup lang="ts">
import { Course, CourseLabels } from "~/enums/Course";
import { CurriculumYear, CurriculumYearLabels } from "~/enums/CurriculumYear";

definePageMeta({ layout: false });
useHead({ title: "Bem-vindo — SISGAC" });

const { user, setUser } = useAuthState();
const { patchUser, loading, error } = useUsers();
const { curricula, getCurricula } = useCurricula();

const matricula = ref<string>("");
const course = ref<Course | undefined>();
const curriculumYear = ref<CurriculumYear | undefined>();

const courseOptions = Object.values(Course).map((value) => ({
  label: CourseLabels[value],
  value,
}));

const curriculumYearOptions = computed(() =>
  curricula.value.map((c) => ({
    label: CurriculumYearLabels[c.year as CurriculumYear] ?? c.year,
    value: c.year,
  })),
);

onMounted(async () => {
  await getCurricula();
});

const isValid = computed(() => {
  const mat = matricula.value.trim();
  return /^\d{8}$/.test(mat) && Boolean(course.value) && Boolean(curriculumYear.value);
});

const submit = async () => {
  if (!isValid.value || !user.value) return;
  const updated = await patchUser(user.value.id, {
    matricula: Number(matricula.value),
    course: course.value!,
    curriculumYear: curriculumYear.value!,
  });
  setUser({ ...user.value, ...updated });
  await navigateTo("/");
};
</script>

<template>
  <div class="flex min-h-dvh flex-col lg:flex-row">
    <section
      class="relative flex flex-col overflow-hidden bg-linear-to-br from-primary-600 via-primary-700 to-primary-800 px-6 py-7 sm:px-10 lg:flex-1 lg:px-16 lg:py-16"
      aria-labelledby="brand-wordmark"
    >
      <div class="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary-400/15 blur-3xl" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-32 -left-24 h-112 w-md rounded-full bg-primary-400/15 blur-3xl" aria-hidden="true" />
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        aria-hidden="true"
        style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 24px 24px"
      />

      <div class="relative flex items-center gap-3">
        <div class="h-px w-8 bg-white/40" />
        <span class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70"> Sistema de Gestão Acadêmica </span>
      </div>

      <div class="relative flex flex-col py-5 lg:flex-1 lg:justify-center lg:py-0">
        <h1
          id="brand-wordmark"
          class="select-none text-5xl font-extrabold italic leading-none tracking-tighter text-white sm:text-6xl lg:text-8xl xl:text-9xl"
        >
          SISGAC
        </h1>
        <p class="mt-3 max-w-lg text-sm text-white/75 sm:text-lg lg:mt-6 lg:text-xl">Gestão de Atividades Complementares.</p>
      </div>

      <div class="relative mt-8 hidden flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-white/50 lg:mt-0 lg:flex">
        <span>© 2026 SISGAC</span>
      </div>
    </section>

    <section
      class="flex w-full flex-1 flex-col items-center bg-white px-6 py-10 sm:px-10 lg:w-150 lg:flex-none lg:justify-center lg:px-14"
      aria-label="Completar cadastro"
    >
      <div class="flex w-full max-w-md flex-1 flex-col lg:flex-none">
        <div>
          <div class="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary-600">Quase lá</div>

          <h2 class="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">Complete seu cadastro</h2>

          <p class="mt-3 text-sm leading-relaxed text-neutral-500">
            Olá, {{ user?.firstName }}! Precisamos de mais algumas informações para continuar.
          </p>
        </div>

        <form class="mt-8 space-y-5 lg:mt-10" @submit.prevent="submit">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-neutral-700">Número de matrícula</label>
            <SGInput v-model="matricula" placeholder="Ex: 12345678" type="text" inputmode="numeric" maxlength="8" />
            <p v-if="matricula.length > 0 && !/^\d{8}$/.test(matricula)" class="text-xs text-error-500">
              A matrícula deve conter exatamente 8 dígitos numéricos.
            </p>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-neutral-700">Curso</label>
            <SGSelect v-model="course" placeholder="Selecione seu curso" :options="courseOptions" />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-neutral-700">Currículo</label>
            <SGSelect
              v-if="curriculumYearOptions.length > 0"
              v-model="curriculumYear"
              placeholder="Selecione o ano do seu currículo"
              :options="curriculumYearOptions"
            />
            <p v-else class="rounded-lg border border-dashed border-neutral-200 px-3 py-2 text-xs text-neutral-500">
              Nenhum currículo configurado. Contate o administrador.
            </p>
          </div>

          <div
            v-if="error"
            class="flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 px-3 py-2.5"
            role="alert"
          >
            <Icon name="lucide:circle-alert" size="1rem" class="mt-0.5 shrink-0 text-error-600" />
            <p class="text-sm text-error-700">{{ error }}</p>
          </div>

          <SGButton type="submit" variant="primary" size="lg" block :loading="loading" :disabled="!isValid">
            Concluir cadastro
          </SGButton>
        </form>

        <div class="mt-8 lg:mt-10">
          <div class="flex items-center gap-3">
            <div class="h-px flex-1 bg-neutral-200" />
            <span class="text-xs font-medium uppercase tracking-widest text-neutral-400">Suporte</span>
            <div class="h-px flex-1 bg-neutral-200" />
          </div>

          <p class="mt-4 text-center text-xs leading-relaxed text-neutral-500">
            Dados incorretos? Entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
