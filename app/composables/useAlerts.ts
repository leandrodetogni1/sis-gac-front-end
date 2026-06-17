import Swal, { type SweetAlertIcon } from "sweetalert2";

const errorAlert = (message: string) => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
    confirmButtonColor: "#111",
  });
};

const successAlert = (message: string) => {
  Swal.fire({
    icon: "success",
    title: "Success...",
    text: message,
    confirmButtonColor: "#111",
  });
};

const loadingAlert = (message: string) => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });
};

const closeAlert = () => {
  Swal.close();
};

const confirmAlert = async (message: string, newTitle: string, icon?: SweetAlertIcon) => {
  return Swal.fire({
    title: newTitle,
    icon: icon,
    text: message,
    confirmButtonColor: "#111",
    focusConfirm: false,
    showCancelButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      return true;
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      return false;
    }
  });
};

const promptAlert = async (
  title: string,
  message: string,
  options?: {
    placeholder?: string;
    confirmText?: string;
    icon?: SweetAlertIcon;
    required?: boolean;
  },
): Promise<string | null> => {
  const result = await Swal.fire({
    title,
    text: message,
    icon: options?.icon,
    input: "textarea",
    inputPlaceholder: options?.placeholder ?? "",
    confirmButtonText: options?.confirmText ?? "Confirmar",
    confirmButtonColor: "#111",
    focusConfirm: false,
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    inputValidator: options?.required
      ? (value) => (!value || !value.trim() ? "Campo obrigatório" : null)
      : undefined,
  });

  if (!result.isConfirmed) return null;
  return (result.value ?? "").trim();
};

export const useAlerts = () => {
  return { errorAlert, confirmAlert, promptAlert, successAlert, loadingAlert, closeAlert };
};
