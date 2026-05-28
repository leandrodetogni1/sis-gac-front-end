import type { Course } from "~/enums/Course";
import type { CurriculumYear } from "~/enums/CurriculumYear";
import type { CreateCurriculumDto } from "~/interfaces/CreateCurriculumDto";
import type { CurriculumResponseDto } from "~/interfaces/CurriculumResponseDto";
import type { CurriculumSummaryDto } from "~/interfaces/CurriculumSummaryDto";
import type { UpdateCurriculumDto } from "~/interfaces/UpdateCurriculumDto";
import type { UpsertActivityTypeRuleDto } from "~/interfaces/UpsertActivityTypeRuleDto";
import type { UpsertCourseRuleDto } from "~/interfaces/UpsertCourseRuleDto";

export const useCurricula = () => {
  const api = useApi();
  const curricula = ref<CurriculumSummaryDto[]>([]);
  const curriculum = ref<CurriculumResponseDto | null>(null);
  const loading = ref(false);
  const fetched = ref(false);
  const error = ref<string | null>(null);

  const getCurricula = async (): Promise<CurriculumSummaryDto[]> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<CurriculumSummaryDto[]>("/api/curricula");
      curricula.value = data;
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar currículos";
      return [];
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  const getCurriculum = async (year: CurriculumYear | string): Promise<CurriculumResponseDto | null> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<CurriculumResponseDto>(`/api/curricula/${year}`);
      curriculum.value = data;
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar currículo";
      return null;
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  const createCurriculum = async (payload: CreateCurriculumDto): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await api("/api/curricula", { method: "POST", body: payload });
      await getCurricula();
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao criar currículo";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateCurriculum = async (year: CurriculumYear | string, payload: UpdateCurriculumDto): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await api(`/api/curricula/${year}`, { method: "PATCH", body: payload });
      await getCurriculum(year);
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao atualizar currículo";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteCurriculum = async (year: CurriculumYear | string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await api(`/api/curricula/${year}`, { method: "DELETE" });
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao remover currículo";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const upsertCourseRule = async (
    year: CurriculumYear | string,
    course: Course | string,
    payload: UpsertCourseRuleDto,
  ): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await api(`/api/curricula/${year}/course-rules/${course}`, { method: "PUT", body: payload });
      await getCurriculum(year);
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao salvar regra de curso";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteCourseRule = async (year: CurriculumYear | string, course: Course | string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await api(`/api/curricula/${year}/course-rules/${course}`, { method: "DELETE" });
      await getCurriculum(year);
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao remover regra de curso";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const upsertActivityTypeRule = async (
    year: CurriculumYear | string,
    cod: string,
    payload: UpsertActivityTypeRuleDto,
  ): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await api(`/api/curricula/${year}/activity-type-rules/${cod}`, { method: "PUT", body: payload });
      await getCurriculum(year);
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao salvar regra do tipo de atividade";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteActivityTypeRule = async (year: CurriculumYear | string, cod: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await api(`/api/curricula/${year}/activity-type-rules/${cod}`, { method: "DELETE" });
      await getCurriculum(year);
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao remover regra do tipo de atividade";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    curricula,
    curriculum,
    loading,
    fetched,
    error,
    getCurricula,
    getCurriculum,
    createCurriculum,
    updateCurriculum,
    deleteCurriculum,
    upsertCourseRule,
    deleteCourseRule,
    upsertActivityTypeRule,
    deleteActivityTypeRule,
  };
};
