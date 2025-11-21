import { useState, useCallback } from "react";

/**
 * Custom hook to handle copying text to clipboard.
 * Replaces the deprecated/removed useClipboard from Chakra UI v3.
 * @param initialValue - Initial value to set
 */
export function useClipboard(initialValue: string = "") {
  const [value, setValue] = useState(initialValue);
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = useCallback(
    async (text?: string) => {
      const textToCopy = typeof text === "string" ? text : value;
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(textToCopy);
          setHasCopied(true);
          setTimeout(() => setHasCopied(false), 1500);
        } else {
          throw new Error("Clipboard API not available");
        }
      } catch (error) {
        console.error("Failed to copy:", error);
        setHasCopied(false);
      }
    },
    [value]
  );

  return { value, setValue, onCopy, hasCopied };
}
