import { Flex, MenuContent, Stack } from "@chakra-ui/react";
import { signOut, type User } from "firebase/auth";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import type React from "react";
import { CgProfile } from "react-icons/cg";
import { MdOutlineAdminPanelSettings, MdOutlineLogin } from "react-icons/md";
import { authModalStateAtom } from "@/atoms/authModalAtom";
import CustomMenuButton from "@/components/ui/CustomMenuButton";
import { ROUTES } from "@/constants/routes";
import { auth } from "@/firebase/clientApp";
import { isSuperAdmin } from "@/lib/community/communityPermissions";

interface UserMenuListProps {
  user: User | null | undefined;
  setProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Menu content for the user dropdown, showing profile and auth actions.
 * @param user - Firebase user to decide between auth options.
 * @param setProfileModalOpen - Setter to open the profile modal.
 * @returns MenuContent with action buttons.
 */
const UserMenuList: React.FC<UserMenuListProps> = ({
  user,
  setProfileModalOpen,
}) => {
  const router = useRouter();
  const setAuthModalState = useSetAtom(authModalStateAtom);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <MenuContent borderRadius={10} mt={2} shadow="lg" minW="180px">
      <Flex justifyContent="center">
        <Stack gap={1} width="98%">
          {user ? (
            <>
              <CustomMenuButton
                icon={<CgProfile />}
                text="Profile"
                onClick={() => setProfileModalOpen(true)}
              />

              {isSuperAdmin(user.uid) && (
                <CustomMenuButton
                  icon={<MdOutlineAdminPanelSettings />}
                  text="Admin"
                  onClick={() => router.push(ROUTES.ADMIN.path)}
                />
              )}

              <CustomMenuButton
                icon={<MdOutlineLogin />}
                text="Log Out"
                onClick={logout}
              />
            </>
          ) : (
            <CustomMenuButton
              icon={<MdOutlineLogin />}
              text="Log In / Sign Up"
              onClick={() => setAuthModalState({ open: true, view: "login" })}
            />
          )}
        </Stack>
      </Flex>
    </MenuContent>
  );
};

export default UserMenuList;
