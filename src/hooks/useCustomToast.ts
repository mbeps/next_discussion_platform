import { useToast } from "@chakra-ui/react";

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
  const toast = useToast();

  const showToast = ({ title, description, status }: CustomToastOptions) => {
    toast({
      title,
      description,
      status,
      duration: 5000, // Hardcoded duration
      isClosable: true, // Hardcoded isClosable
    });
  };

  return showToast;
};

export default useCustomToast;
