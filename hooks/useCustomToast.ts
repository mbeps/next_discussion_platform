import { createToaster } from "@chakra-ui/react";

/**
 * Interface for the options of the toast.
 * @property {string} title - title of the toast
 * @property {string} description - description of the toast
 * @property {"success" | "error" | "warning" | "info"} status - status of the toast
 */
interface CustomToastOptions {
  title: string;
  description?: string;
  status: "success" | "error" | "warning" | "info";
}

export const toaster = createToaster({
  placement: "top",
  gap: 16,
});

/**
 * Displays a toast with the given options.
 * Depending on the status, the toast will have a different color.
 * There are 4 types of status: success, error, warning, info.
 * @param {string} title - title of the toast
 * @param {string} description - description of the toast
 * @param {"success" | "error" | "warning" | "info"} status - status of the toast
 *
 * @returns {function} - function which shows a toast
 */
const useCustomToast = () => {
  const showToast = ({ title, description, status }: CustomToastOptions) => {
    toaster.create({
      title,
      description,
      type: status,
      closable: true,
      duration: 5000,
    });
  };

  return showToast;
};

export default useCustomToast;
