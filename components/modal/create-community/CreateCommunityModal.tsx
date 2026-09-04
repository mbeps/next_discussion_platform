import {
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useForm } from "react-hook-form";
import { BsFillEyeFill, BsFillPersonFill } from "react-icons/bs";
import { HiLockClosed } from "react-icons/hi";
import { useCreateCommunity } from "@/hooks/community/useCreateCommunity";
import {
  type CreateCommunityInput,
  createCommunitySchema,
} from "@/schema/community";
import CommunityNameSection from "./CommunityNameSection";
import CommunityTypeOptions from "./CommunityTypeOptions";

const COMMUNITY_TYPE_OPTIONS = [
  {
    name: "public",
    icon: BsFillPersonFill,
    label: "Public",
    description: "Everyone can view and post",
  },
  {
    name: "restricted",
    icon: BsFillEyeFill,
    label: "Restricted",
    description: "Everyone can view but only subscribers can post",
  },
  {
    name: "private",
    icon: HiLockClosed,
    label: "Private",
    description: "Only subscribers can view and post",
  },
];

type CreateCommunityModalProps = {
  open: boolean;
  handleClose: () => void;
};

/**
 * Modal for creating a new community with name validation and privacy selection.
 * @param open - Whether the modal is visible.
 * @param handleClose - Callback to close the modal.
 * @returns Dialog with community creation form.
 */
const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  open,
  handleClose,
}) => {
  const { createCommunity, loading } = useCreateCommunity();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCommunityInput>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      type: "public",
      name: "",
    },
    mode: "onChange",
  });

  const communityName = watch("name");
  const communityType = watch("type");
  const charRemaining = 21 - (communityName?.length || 0);

  const onSubmit = async (data: CreateCommunityInput) => {
    const success = await createCommunity(data.name, data.type);
    if (success) {
      handleClose();
    }
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={({ open }: { open: boolean }) => {
        if (!open) handleClose();
      }}
    >
      <DialogBackdrop bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(6px)" />
      <DialogPositioner>
        <DialogContent borderRadius={10}>
          <DialogHeader
            display="flex"
            flexDirection="column"
            padding={3}
            textAlign="center"
          >
            <DialogTitle>Create Community</DialogTitle>
          </DialogHeader>
          <Box pl={3} pr={3}>
            <DialogCloseTrigger position="absolute" top={2} right={2} />
            <DialogBody
              display="flex"
              flexDirection="column"
              padding="10px 0px"
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                <CommunityNameSection
                  charRemaining={charRemaining}
                  error={errors.name?.message}
                  register={register("name")}
                />
                <Separator mt={3} />
                <Box mt={4} mb={4}>
                  <Text fontWeight={600} fontSize={15}>
                    Community Type
                  </Text>

                  <CommunityTypeOptions
                    options={COMMUNITY_TYPE_OPTIONS}
                    communityType={communityType}
                    onCommunityTypeChange={(value) =>
                      setValue("type", value as any)
                    }
                  />
                </Box>
              </form>
            </DialogBody>
          </Box>

          <DialogFooter
            bg={{ base: "gray.100", _dark: "gray.700" }}
            borderRadius="0px 0px 10px 10px"
          >
            <Stack direction="row" gap={3} width="100%">
              <Button
                variant="outline"
                height="30px"
                flex={1}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                height="30px"
                flex={1}
                onClick={handleSubmit(onSubmit)}
                loading={loading}
              >
                Create Community
              </Button>
            </Stack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default CreateCommunityModal;
