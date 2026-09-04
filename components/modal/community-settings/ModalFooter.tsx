import { Button, DialogFooter, Stack } from "@chakra-ui/react";
import type React from "react";

type ModalFooterProps = {
  onCancel: () => void;
  onSave: () => void;
};

/**
 * Footer component for the Community Settings Modal with Cancel and Save buttons
 */
const ModalFooter: React.FC<ModalFooterProps> = ({ onCancel, onSave }) => {
  return (
    <DialogFooter
      bg={{ base: "gray.100", _dark: "gray.700" }}
      borderRadius="0px 0px 10px 10px"
    >
      <Stack direction="row" justifyContent="space-between" width="100%">
        <Button
          width="100%"
          variant="outline"
          height="30px"
          mr={3}
          onClick={onCancel}
          flex={1}
        >
          Cancel
        </Button>
        <Button width="100%" height="30px" onClick={onSave} flex={1}>
          Save
        </Button>
      </Stack>
    </DialogFooter>
  );
};

export default ModalFooter;
