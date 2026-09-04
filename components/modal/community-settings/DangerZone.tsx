import { Button, Stack, Text } from "@chakra-ui/react";
import type React from "react";
import { useState } from "react";
import ConfirmationDialog from "@/components/modal/ConfirmationDialog";

type DangerZoneProps = {
  deleteCommunity: () => Promise<void>;
  loading: boolean;
};

/**
 * Component for dangerous community actions like deletion
 */
const DangerZone: React.FC<DangerZoneProps> = ({
  deleteCommunity,
  loading,
}) => {
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  return (
    <Stack>
      <Text fontWeight={600} fontSize="12pt" color="red.500">
        Danger Zone
      </Text>
      <Text fontSize="9pt" color={{ base: "gray.600", _dark: "gray.400" }}>
        Once you delete a community, there is no going back. Please be certain.
      </Text>
      <Button
        variant="outline"
        colorPalette="red"
        height="30px"
        onClick={() => setDeleteConfirmationOpen(true)}
        loading={loading}
      >
        Delete Community
      </Button>
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        onConfirm={() => {
          deleteCommunity();
          setDeleteConfirmationOpen(false);
        }}
        title="Delete Community"
        body="Are you sure you want to delete this community? This action cannot be undone and will delete all posts and comments."
        confirmButtonText="Delete Community"
        isLoading={loading}
      />
    </Stack>
  );
};

export default DangerZone;
