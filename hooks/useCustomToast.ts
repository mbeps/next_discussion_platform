import { useCallback } from "react";
import { toaster } from "@/components/ui/toaster";

interface CustomToastOptions {
  title: string;
  description?: string;
  status: "success" | "error" | "warning" | "info";
}

/**
 * A custom hook that provides a simplified interface for displaying Chakra UI toasts.
 * It centralizes toast configuration such as duration and closability to ensure a consistent user experience.
 * @returns A function that can be called with title, description, and status to trigger a toast notification.
 */
const useCustomToast = () => {
  const showToast = useCallback(
    ({ title, description, status }: CustomToastOptions) => {
      try {
        toaster.create({
          title,
          description,
          type: status,
          closable: true,
          duration: 5000,
        });
      } catch (error) {
        console.error("Toast error:", error);
      }
    },
    [],
  );

  return showToast;
};

export default useCustomToast;
