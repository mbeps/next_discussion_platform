import {
  Button,
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Portal,
} from "@chakra-ui/react";
import type React from "react";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isLoading?: boolean;
}

/**
 * A reusable modal dialog for confirming user actions, particularly destructive ones like deletions.
 * Provides customizable title, body text, and button labels, with support for loading states.
 * @param open - Whether the dialog is currently visible.
 * @param onClose - Callback to close the dialog without confirming.
 * @param onConfirm - Callback triggered when the user confirms the action.
 * @param title - The header text for the dialog.
 * @param body - The main message text for the dialog.
 * @param confirmButtonText - Custom label for the confirmation button.
 * @param cancelButtonText - Custom label for the cancellation button.
 * @param isLoading - Whether the confirmation action is currently in progress.
 * @returns A themed confirmation modal.
 */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  isLoading = false,
}) => {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(details: { open: boolean }) => !details.open && onClose()}
      placement="center"
    >
      <Portal>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent borderRadius={"xl"}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <DialogBody>{body}</DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  disabled={isLoading}
                >
                  {cancelButtonText}
                </Button>
              </DialogActionTrigger>
              <Button
                colorPalette="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm();
                }}
                loading={isLoading}
              >
                {confirmButtonText}
              </Button>
            </DialogFooter>
            <DialogCloseTrigger
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onClose();
              }}
            />
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </DialogRoot>
  );
};

export default ConfirmationDialog;
