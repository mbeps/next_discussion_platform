import {
  Box,
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogPositioner,
  DialogRoot,
  Flex,
  Icon,
  Image,
  Input,
  InputGroup,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { useRouter } from "next/navigation";
import type React from "react";
import { useRef, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import useSearch from "@/hooks/useSearch";
import type { Post } from "@/types/post";

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * A full-screen search dialog that allows users to find communities and posts.
 * Uses a custom search hook to filter preloaded data and provides navigation to results.
 * @param isOpen - Whether the modal is currently visible.
 * @param onClose - Callback to close the modal and reset search state.
 * @returns A dialog containing a search input and categorized results.
 */
const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { results, loading } = useSearch(searchTerm);
  const router = useRouter();
  const initialRef = useRef(null);

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  const onSelectCommunity = (communityId: string) => {
    router.push(`/community/${communityId}`);
    handleClose();
  };

  const onSelectPost = (post: Post) => {
    router.push(`/community/${post.communityId}/comments/${post.id}`);
    handleClose();
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e: { open: boolean }) => !e.open && handleClose()}
      size="xl"
      initialFocusEl={() => initialRef.current}
      placement="top"
    >
      <DialogBackdrop />
      <DialogPositioner>
        <Box
          as={DialogContent}
          bg="white"
          _dark={{ bg: "gray.800" }}
          mt="10vh"
          borderRadius="12px"
        >
          <DialogBody p={4}>
            <InputGroup
              startElement={
                <Icon as={AiOutlineSearch} color="gray.400" fontSize={20} />
              }
              width="100%"
            >
              <Input
                ref={initialRef}
                placeholder="Search communities and posts..."
                fontSize="12pt"
                _placeholder={{ color: "gray.500" }}
                _hover={{
                  bg: "white",
                  border: "1px solid",
                  borderColor: "blue.500",
                }}
                _focus={{
                  outline: "none",
                  border: "1px solid",
                  borderColor: "blue.500",
                }}
                height="50px"
                bg="gray.50"
                _dark={{
                  bg: "gray.700",
                  borderColor: "gray.600",
                  _hover: {
                    bg: "gray.600",
                    border: "1px solid",
                    borderColor: "blue.400",
                  },
                }}
                borderRadius="xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            {searchTerm && (
              <Box mt={4} maxHeight="60vh" overflowY="auto">
                {loading ? (
                  <Flex justify="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : (
                  <Stack gap={4}>
                    {results.communities.length > 0 && (
                      <Box>
                        <Text
                          fontWeight={700}
                          color="gray.500"
                          fontSize="sm"
                          mb={2}
                          textTransform="uppercase"
                        >
                          Communities
                        </Text>
                        <Stack gap={2}>
                          {results.communities.map((item) => (
                            <Flex
                              key={item.id}
                              align="center"
                              p={2}
                              _hover={{ bg: "gray.100" }}
                              _dark={{ _hover: { bg: "gray.700" } }}
                              cursor="pointer"
                              borderRadius="xl"
                              onClick={() => onSelectCommunity(item.id)}
                            >
                              {item.imageURL ? (
                                <Image
                                  src={item.imageURL}
                                  borderRadius="full"
                                  boxSize="30px"
                                  mr={3}
                                  alt={item.id}
                                />
                              ) : (
                                <Icon
                                  as={AiOutlineSearch}
                                  fontSize={30}
                                  mr={3}
                                  color="blue.500"
                                />
                              )}
                              <Flex direction="column">
                                <Text fontWeight={600}>{item.id}</Text>
                                <Text fontSize="xs" color="gray.500">
                                  {item.numberOfMembers} members
                                </Text>
                              </Flex>
                            </Flex>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {results.posts.length > 0 && (
                      <Box>
                        <Text
                          fontWeight={700}
                          color="gray.500"
                          fontSize="sm"
                          mb={2}
                          textTransform="uppercase"
                        >
                          Posts
                        </Text>
                        <Stack gap={2}>
                          {results.posts.map((item) => (
                            <Flex
                              key={item.id}
                              direction="column"
                              p={2}
                              _hover={{ bg: "gray.100" }}
                              _dark={{ _hover: { bg: "gray.700" } }}
                              cursor="pointer"
                              borderRadius="xl"
                              onClick={() => onSelectPost(item)}
                            >
                              <Text fontWeight={600}>{item.title}</Text>
                              <Text fontSize="xs" color="gray.500">
                                {item.communityId} • Posted by u/
                                {item.creatorUsername}{" "}
                                {moment(
                                  new Date(item.createTime?.seconds * 1000),
                                ).fromNow()}
                              </Text>
                            </Flex>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {results.communities.length === 0 &&
                      results.posts.length === 0 && (
                        <Flex justify="center" p={4}>
                          <Text color="gray.500">No results found</Text>
                        </Flex>
                      )}
                  </Stack>
                )}
              </Box>
            )}
          </DialogBody>
        </Box>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default SearchModal;
