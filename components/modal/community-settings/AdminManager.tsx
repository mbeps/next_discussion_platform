import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useForm } from "react-hook-form";
import ConfirmationDialog from "@/components/modal/ConfirmationDialog";
import { auth } from "@/firebase/clientApp";
import useAddAdmin from "@/hooks/admin/useAddAdmin";
import useAdminList from "@/hooks/admin/useAdminList";
import useAdminSearch from "@/hooks/admin/useAdminSearch";
import useRemoveAdmin from "@/hooks/admin/useRemoveAdmin";
import useCustomToast from "@/hooks/useCustomToast";
import { type AddAdminInput, addAdminSchema } from "@/schema/admin";
import type { AdminUser } from "@/types/adminUser";
import type { Community } from "@/types/community";

type AdminManagerProps = {
  communityData: Community;
};

/**
 * Admin management panel for adding and removing moderators on a community.
 * Handles email search, duplication checks, and confirmation before removal.
 * @param communityData - Community context for permission and mutations.
 * @returns Form and list UI for managing admin users.
 */
const AdminManager: React.FC<AdminManagerProps> = ({ communityData }) => {
  const { admins, setAdmins, loading, loadAdmins } = useAdminList();
  const { searchUsers, findUser } = useAdminSearch();
  const { handleAddAdmin } = useAddAdmin();
  const { handleRemoveAdmin } = useRemoveAdmin();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<AddAdminInput>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: { email: "" },
  });

  const emailValue = watch("email");

  const [addingAdmin, setAddingAdmin] = useState(false);
  const [searchResults, setSearchResults] = useState<AdminUser[]>([]);
  const [showResults, setShowResults] = useState(false);
  const showToast = useCustomToast();
  const [user] = useAuthState(auth);
  const [adminToRemove, setAdminToRemove] = useState<string | null>(null);
  const [removingAdmin, setRemovingAdmin] = useState(false);

  useEffect(() => {
    loadAdmins(communityData.creatorId, communityData.adminIds).catch(() => {
      showToast({
        title: "Error",
        description: "Could not fetch admins",
        status: "error",
      });
    });
  }, [communityData, loadAdmins, showToast]);

  const onAddAdmin = async (data: AddAdminInput) => {
    setAddingAdmin(true);
    try {
      // 1. Find user by email
      const newUser = await findUser(data.email);

      if (!newUser) {
        showToast({
          title: "User not found",
          description: "No user found with that email",
          status: "error",
        });
        setAddingAdmin(false);
        return;
      }

      // 2. Check if already admin
      if (admins.some((admin) => admin.uid === newUser.uid)) {
        showToast({
          title: "Already admin",
          description: "This user is already an admin",
          status: "warning",
        });
        setAddingAdmin(false);
        return;
      }

      // 3. Add admin (updates Firestore + local + global state)
      await handleAddAdmin(
        communityData.id,
        newUser,
        communityData.imageURL,
        setAdmins,
      );

      reset();

      showToast({
        title: "Admin added",
        description: `${newUser.email} is now an admin`,
        status: "success",
      });
    } catch (error: any) {
      console.error("Error adding admin", error);
      showToast({
        title: "Error",
        description: "Could not add admin",
        status: "error",
      });
    } finally {
      setAddingAdmin(false);
    }
  };

  const confirmRemoveAdmin = async () => {
    if (!adminToRemove) return;
    setRemovingAdmin(true);
    try {
      // Remove admin (updates Firestore + local + global state)
      await handleRemoveAdmin(communityData.id, adminToRemove, setAdmins);

      showToast({
        title: "Admin removed",
        description: "User is no longer an admin",
        status: "success",
      });
    } catch (error: any) {
      console.error("Error removing admin", error);
      showToast({
        title: "Error",
        description: "Could not remove admin",
        status: "error",
      });
    } finally {
      setRemovingAdmin(false);
      setAdminToRemove(null);
    }
  };

  useEffect(() => {
    const searchUsersAsync = async () => {
      if (!emailValue || emailValue.length < 3) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      try {
        const results = await searchUsers(emailValue);
        // Filter out existing admins
        const filtered = results.filter(
          (u) => !admins.some((a) => a.uid === u.uid),
        );
        setSearchResults(filtered);
        setShowResults(true);
      } catch (error) {
        console.error(error);
      }
    };

    const timer = setTimeout(searchUsersAsync, 300);
    return () => clearTimeout(timer);
  }, [emailValue, admins, searchUsers]);

  return (
    <Stack gap={4}>
      <Text fontSize="lg" fontWeight={600}>
        Manage Admins
      </Text>

      <Box position="relative">
        <Flex gap={2} direction="column">
          <Flex gap={2}>
            <Input
              placeholder="Enter email to add admin"
              {...register("email")}
              onFocus={() =>
                emailValue && emailValue.length >= 3 && setShowResults(true)
              }
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              borderRadius={"xl"}
            />
            <Button
              onClick={handleSubmit(onAddAdmin)}
              loading={addingAdmin}
              disabled={!emailValue}
            >
              Add
            </Button>
          </Flex>
          {errors.email && (
            <Text color="red.500" fontSize="xs">
              {errors.email.message}
            </Text>
          )}
        </Flex>
        {showResults && searchResults.length > 0 && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            zIndex={1000}
            bg="white"
            _dark={{ bg: "gray.700", borderColor: "gray.600" }}
            shadow="md"
            borderRadius="xl"
            mt={1}
            maxH="200px"
            overflowY="auto"
            border="1px solid"
            borderColor="gray.200"
          >
            {searchResults.map((user) => (
              <Box
                key={user.uid}
                p={2}
                borderRadius="xl"
                cursor="pointer"
                _hover={{ bg: "gray.100", _dark: { bg: "gray.600" } }}
                onClick={() => {
                  setValue("email", user.email);
                  setShowResults(false);
                }}
              >
                <Text fontSize="sm" fontWeight="bold">
                  {user.email}
                </Text>
                {user.displayName && (
                  <Text fontSize="xs" color="gray.500">
                    {user.displayName}
                  </Text>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {loading ? (
        <Flex justify="center" p={4}>
          <Spinner />
        </Flex>
      ) : (
        <Stack gap={2}>
          {admins.map((admin) => (
            <Flex
              key={admin.uid}
              align="center"
              justify="space-between"
              p={2}
              borderWidth="1px"
              borderRadius="xl"
            >
              <Stack gap={0}>
                <Text fontWeight={600}>{admin.displayName || "No Name"}</Text>
                <Text fontSize="sm" color="gray.500">
                  {admin.email}
                </Text>
              </Stack>
              {admin.uid !== communityData.creatorId &&
                admin.uid !== user?.uid && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="red"
                    onClick={() => setAdminToRemove(admin.uid)}
                  >
                    Remove
                  </Button>
                )}
              {admin.uid === communityData.creatorId && (
                <Text fontSize="xs" color="gray.500" fontStyle="italic">
                  Creator
                </Text>
              )}
            </Flex>
          ))}
        </Stack>
      )}
      <ConfirmationDialog
        open={!!adminToRemove}
        onClose={() => setAdminToRemove(null)}
        onConfirm={confirmRemoveAdmin}
        title="Remove Admin"
        body="Are you sure you want to remove this user from admins?"
        confirmButtonText="Remove"
        isLoading={removingAdmin}
      />
    </Stack>
  );
};

export default AdminManager;
