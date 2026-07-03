import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

type ToastFunction = (message: string) => void;

export const useToastNotification = () => {
  const showToastSuccess: ToastFunction = (message: string) => {
    toast.success(message, {
      theme: "colored",
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: 2500,
    });
  };

  const showToastError: ToastFunction = (message: string) => {
    toast.error(message, {
      theme: "colored",
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: 2500,
    });
  };

  const showToastInfo: ToastFunction = (message: string) => {
    toast.info(message, {
      theme: "colored",
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: 2500,
    });
  };

  const showToastWarning: ToastFunction = (message: string) => {
    toast.warning(message, {
      theme: "colored",
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: 2500,
    });
  };

  return {
    showToastSuccess,
    showToastError,
    showToastInfo,
    showToastWarning,
  };
};
