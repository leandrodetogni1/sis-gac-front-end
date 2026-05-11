import type { CreateInvitationDto } from "~/interfaces/CreateInvitationDto";
import type { InvitationResponseDto } from "~/interfaces/InvitationResponseDto";

type CreateInvitationResult = {
  message: string;
  invitation: InvitationResponseDto;
};

export const useInvitations = () => {
  const api = useApi();
  const invitations = ref<InvitationResponseDto[]>([]);
  const loading = ref(false);
  const fetched = ref(false);
  const error = ref<string | null>(null);

  const getInvitations = async (): Promise<InvitationResponseDto[]> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<InvitationResponseDto[]>("/api/invitations");
      invitations.value = data;
      return data;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao carregar convites";
      return [];
    } finally {
      loading.value = false;
      fetched.value = true;
    }
  };

  const createInvitation = async (payload: CreateInvitationDto): Promise<InvitationResponseDto> => {
    loading.value = true;
    error.value = null;
    try {
      const data = await api<CreateInvitationResult>("/api/invitations", {
        method: "POST",
        body: payload,
      });
      await getInvitations();
      return data.invitation;
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao criar convite";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteInvitation = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await api(`/api/invitations/${id}`, { method: "DELETE" });
      await getInvitations();
    } catch (e: any) {
      error.value = e?.data?.message ?? "Erro ao revogar convite";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    invitations,
    loading,
    fetched,
    error,
    getInvitations,
    createInvitation,
    deleteInvitation,
  };
};
