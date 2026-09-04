import {
  Box,
  Button,
  Flex,
  Icon,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "firebase/auth";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LuSend, LuTrash } from "react-icons/lu";
import ProfileModal from "@/components/modal/profile/ProfileModal";
import AuthButtons from "@/components/navbar/right-content/AuthButtons";
import {
  type CommentInput as CommentInputType,
  commentSchema,
} from "@/schema/comment";

type CommentInputProps = {
  user?: User | null;
  createLoading: boolean;
  onCreateComment: (commentText: string) => void;
};

const CommentInput: React.FC<CommentInputProps> = ({
  user,
  createLoading,
  onCreateComment,
}) => {
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<CommentInputType>({
    resolver: zodResolver(commentSchema),
    mode: "onChange",
  });

  const commentText = watch("text");

  const onSubmit = (data: CommentInputType) => {
    console.log("Submitting comment:", data.text);
    onCreateComment(data.text);
    reset();
  };

  return (
    <Flex direction="column" position="relative">
      {user ? (
        <Box width="100%">
          <ProfileModal
            handleClose={() => setProfileModalOpen(false)}
            open={isProfileModalOpen}
          />
          <Stack direction="row" align="center" gap={1} mb={2}>
            <Text color={{ base: "gray.600", _dark: "gray.400" }}>
              Comment as
            </Text>
            <Text
              color={{ base: "gray.600", _dark: "gray.400" }}
              fontSize="10pt"
              _hover={{
                cursor: "pointer",
                textDecoration: "underline",
                color: { base: "red.500", _dark: "red.400" },
              }}
              onClick={() => setProfileModalOpen(true)}
            >
              {user?.email?.split("@")[0]}
            </Text>
          </Stack>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }}
          >
            <Flex
              direction="column"
              bg={{ base: "white", _dark: "gray.800" }}
              borderRadius="xl"
              border="1px solid"
              borderColor={{ base: "gray.200", _dark: "gray.600" }}
              overflow="hidden"
              _focusWithin={{
                borderColor: { base: "black", _dark: "gray.200" },
                boxShadow: {
                  base: "0 0 0 1px black",
                  _dark: "0 0 0 1px gray.200",
                },
              }}
            >
              <Textarea
                placeholder="What are your thoughts?"
                fontSize="11pt"
                minHeight="100px"
                border="none"
                _focus={{ outline: "none", border: "none", boxShadow: "none" }}
                p={4}
                bg="transparent"
                _placeholder={{ color: "gray.500" }}
                {...register("text")}
              />
              {errors.text && (
                <Text color="red.500" fontSize="10pt" p={2}>
                  {errors.text.message}
                </Text>
              )}

              <Flex
                bg={{ base: "gray.50", _dark: "gray.700" }}
                p={2}
                justify="flex-end"
                align="center"
                borderTop="1px solid"
                borderColor={{ base: "gray.100", _dark: "gray.600" }}
              >
                <Stack direction="row" gap={2} align="center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reset()}
                    disabled={!commentText?.length}
                    height={"36px"}
                  >
                    <Icon as={LuTrash} mr={2} />
                    Clear
                  </Button>

                  <Button
                    disabled={!isValid}
                    loading={createLoading}
                    borderRadius={"xl"}
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    height={"36px"}
                  >
                    <Icon as={LuSend} mr={2} />
                    Comment
                  </Button>
                </Stack>
              </Flex>
            </Flex>
          </form>
        </Box>
      ) : (
        <Flex
          align="center"
          justify="space-between"
          borderRadius={2}
          border="1px solid"
          borderColor={{ base: "gray.100", _dark: "gray.700" }}
          p={4}
        >
          <Text fontWeight={600}>Log in or sign up to comment</Text>
          <AuthButtons />
        </Flex>
      )}
    </Flex>
  );
};
export default CommentInput;
