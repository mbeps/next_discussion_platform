import React from "react";
import { auth, firestore } from "@/firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Text,
  Flex,
  Image,
  Icon,
  Stack,
} from "@chakra-ui/react";
import { MdAccountCircle } from "react-icons/md";
import { User } from "@firebase/auth";

type ProfileModalProps = {
  open: boolean;
  handleClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ open, handleClose }) => {
  const [user] = useAuthState(auth);

  return (
    <>
      <Modal isOpen={open} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent borderRadius={10}>
          <ModalHeader
            display="flex"
            flexDirection="column"
            padding={3}
            textAlign="center"
          >
            Profile
          </ModalHeader>
          <Box>
            <ModalCloseButton />
            <ModalBody display="flex" flexDirection="column" padding="10px 0px">
              <Stack p={5} spacing={5}>
                <ProfileModalPicture user={user} />
                <ProfileModalUserDetails user={user} />
              </Stack>
            </ModalBody>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};
export default ProfileModal;

type ProfileModalPictureProps = {
  user: User | null | undefined;
};

const ProfileModalPicture: React.FC<ProfileModalPictureProps> = ({ user }) => {
  return (
    <Flex align="center" justify="center" p={2}>
      {user?.photoURL ? (
        <Image
          src={user.photoURL}
          alt="User Profile Photo"
          height="120px"
          borderRadius="full"
          shadow="md"
        />
      ) : (
        <Icon fontSize={120} mr={1} color="gray.300" as={MdAccountCircle} />
      )}
    </Flex>
  );
};

interface ProfileModalUserDetailsProps {
  user: User | null | undefined;
}

const ProfileModalUserDetails: React.FC<ProfileModalUserDetailsProps> = ({
  user,
}) => {
  return (
    <Flex direction="column">
      <Stack direction="row">
        <Text fontWeight={700}>Display Name:</Text>
        <Text>{user?.displayName ? user.displayName : "No Name"}</Text>
      </Stack>
      <Stack direction="row">
        <Text fontWeight={700}>Email:</Text>
        <Text>{user?.email}</Text>
      </Stack>
    </Flex>
  );
};
