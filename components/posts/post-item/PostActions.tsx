import { Button, Clipboard, Icon, Stack, Text } from "@chakra-ui/react";
import type React from "react";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { FiShare2 } from "react-icons/fi";
import { LuTrash } from "react-icons/lu";

interface PostActionsProps {
  handleDelete: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
  loadingDelete: boolean;
  userIsCreator: boolean;
  userIsAdmin: boolean;
  postLink: string;
  handleSave: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  isSaved: boolean;
  showToast: (options: any) => void;
}

/**
 * Action bar for post cards with share, save, and delete controls.
 * @param handleDelete - Delete handler (stops propagation internally).
 * @param loadingDelete - Whether deletion is in progress.
 * @param userIsCreator - Flag to allow delete.
 * @param userIsAdmin - Flag to allow delete via moderation.
 * @param postLink - Canonical link used for sharing.
 * @param handleSave - Save/unsave handler.
 * @param isSaved - Whether the post is saved by the viewer.
 * @param showToast - Toast helper to display copy feedback.
 * @returns Button stack for post interactions.
 */
const PostActions: React.FC<PostActionsProps> = ({
  handleDelete,
  loadingDelete,
  userIsCreator,
  userIsAdmin,
  postLink,
  handleSave,
  isSaved,
  showToast,
}) => (
  <Stack
    ml={1}
    mb={1}
    color="gray.500"
    fontWeight={600}
    direction="row"
    gap={1}
    pb={2}
  >
    <Clipboard.Root
      value={postLink}
      onStatusChange={(details: any) => {
        if (details.copied) {
          showToast({
            title: "Link Copied",
            description: "Link to the post has been saved to your clipboard",
            status: "info",
          });
        }
      }}
    >
      <Button
        as={Clipboard.Trigger as any}
        variant={"action" as any}
        height="32px"
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.stopPropagation();
        }}
      >
        <Icon as={FiShare2} mr={2} />
        <Text fontSize="9pt">Share</Text>
      </Button>
    </Clipboard.Root>

    <Button variant={"action" as any} height="32px" onClick={handleSave}>
      <Icon
        as={isSaved ? BsBookmarkFill : BsBookmark}
        mr={2}
        color={isSaved ? "brand.100" : "gray.500"}
      />
      <Text fontSize="9pt" color={isSaved ? "brand.100" : "gray.500"}>
        {isSaved ? "Saved" : "Save"}
      </Text>
    </Button>

    {(userIsCreator || userIsAdmin) && (
      <Button
        variant={"action" as any}
        height="32px"
        onClick={handleDelete}
        loading={loadingDelete}
      >
        <Icon as={LuTrash} mr={2} />
        <Text fontSize="9pt">Delete</Text>
      </Button>
    )}
  </Stack>
);

export default PostActions;
