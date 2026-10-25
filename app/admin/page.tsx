"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaReddit } from "react-icons/fa";
import {
  MdOpenInNew,
  MdOutlineAdminPanelSettings,
  MdOutlineLock,
  MdOutlinePeopleAlt,
  MdOutlinePublic,
  MdOutlineSecurity,
  MdSearch,
  MdSettings,
} from "react-icons/md";
import PageContent from "@/components/layout/PageContent";
import CommunityLoader from "@/components/loaders/CommunityLoader";
import CommunitySettingsModal from "@/components/modal/community-settings/CommunitySettings";
import { ROUTES } from "@/config/routes";
import { auth } from "@/firebase/clientApp";
import useCommunitiesFeed from "@/hooks/community/useCommunitiesFeed";
import { isSuperAdmin } from "@/lib/community/communityPermissions";
import type { Community } from "@/types/community";

/**
 * Dedicated administration dashboard accessible exclusively to the global super administrator.
 * Displays platform-wide metrics, provides community search/filtering, and allows direct
 * access to community pages and settings management.
 *
 * @returns The Admin Page component or null when unauthorized.
 */
const AdminPage: React.FC = () => {
  const [user, loadingUser] = useAuthState(auth);
  const router = useRouter();

  const isAuthorized = !!user && isSuperAdmin(user.uid);

  useEffect(() => {
    if (!loadingUser && !isAuthorized) {
      router.replace(ROUTES.HOME.path);
    }
  }, [loadingUser, isAuthorized, router]);

  const { communities, loading, fetchCommunities, noMoreCommunities } =
    useCommunitiesFeed({ limitValue: 20, isPagination: true });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrivacy, setFilterPrivacy] = useState<string>("all");
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const stats = useMemo(() => {
    const total = communities.length;
    const publicCount = communities.filter(
      (c) => !c.privacyType || c.privacyType === "public",
    ).length;
    const restrictedCount = communities.filter(
      (c) => c.privacyType === "restricted",
    ).length;
    const privateCount = communities.filter(
      (c) => c.privacyType === "private",
    ).length;
    const totalMembers = communities.reduce(
      (acc, c) => acc + (c.numberOfMembers || 0),
      0,
    );
    return { total, publicCount, restrictedCount, privateCount, totalMembers };
  }, [communities]);

  const filteredCommunities = useMemo(() => {
    return communities.filter((community) => {
      const matchesSearch = community.id
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const privacy = community.privacyType || "public";
      const matchesPrivacy =
        filterPrivacy === "all" || privacy === filterPrivacy;
      return matchesSearch && matchesPrivacy;
    });
  }, [communities, searchTerm, filterPrivacy]);

  const handleOpenSettings = (community: Community) => {
    setSelectedCommunity(community);
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    setSelectedCommunity(null);
  };

  if (loadingUser) {
    return (
      <PageContent>
        <Stack gap={4} p={4} borderRadius={10}>
          <CommunityLoader />
          <CommunityLoader />
          <CommunityLoader />
        </Stack>
        {null}
      </PageContent>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      {selectedCommunity && (
        <CommunitySettingsModal
          open={isSettingsOpen}
          handleClose={handleCloseSettings}
          communityData={selectedCommunity}
        />
      )}

      <PageContent>
        {/* Main Column */}
        <Stack gap={5}>
          {/* Header Banner */}
          <Box
            p={5}
            borderRadius={10}
            bg={{ base: "white", _dark: "gray.800" }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            shadow="sm"
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
              <HStack gap={3}>
                <Flex
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="blue.500"
                  color="white"
                  p={2}
                  fontSize="24px"
                >
                  <MdOutlineAdminPanelSettings />
                </Flex>
                <Box>
                  <HStack gap={2}>
                    <Heading fontSize="xl">Admin Dashboard</Heading>
                  </HStack>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Platform-wide moderation, community governance, and access
                    control.
                  </Text>
                </Box>
              </HStack>
            </Flex>
          </Box>

          {/* Quick Metrics */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
            <Box
              p={4}
              borderRadius={10}
              bg={{ base: "white", _dark: "gray.800" }}
              borderWidth="1px"
              borderColor={{ base: "gray.200", _dark: "gray.700" }}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Flex align="center" gap={2} mb={2} minH="32px">
                <Icon color="blue.500" fontSize="18px" flexShrink={0}>
                  <MdOutlineAdminPanelSettings />
                </Icon>
                <Text
                  fontSize="xs"
                  fontWeight={600}
                  color="gray.500"
                  lineHeight="short"
                >
                  TOTAL COMMUNITIES
                </Text>
              </Flex>
              <Text fontSize="2xl" fontWeight={700} lineHeight="1">
                {stats.total}
              </Text>
            </Box>

            <Box
              p={4}
              borderRadius={10}
              bg={{ base: "white", _dark: "gray.800" }}
              borderWidth="1px"
              borderColor={{ base: "gray.200", _dark: "gray.700" }}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Flex align="center" gap={2} mb={2} minH="32px">
                <Icon color="green.500" fontSize="18px" flexShrink={0}>
                  <MdOutlinePublic />
                </Icon>
                <Text
                  fontSize="xs"
                  fontWeight={600}
                  color="gray.500"
                  lineHeight="short"
                >
                  PUBLIC
                </Text>
              </Flex>
              <Text fontSize="2xl" fontWeight={700} lineHeight="1">
                {stats.publicCount}
              </Text>
            </Box>

            <Box
              p={4}
              borderRadius={10}
              bg={{ base: "white", _dark: "gray.800" }}
              borderWidth="1px"
              borderColor={{ base: "gray.200", _dark: "gray.700" }}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Flex align="center" gap={2} mb={2} minH="32px">
                <Icon color="orange.500" fontSize="18px" flexShrink={0}>
                  <MdOutlineLock />
                </Icon>
                <Text
                  fontSize="xs"
                  fontWeight={600}
                  color="gray.500"
                  lineHeight="short"
                >
                  RESTRICTED / PRIVATE
                </Text>
              </Flex>
              <Text fontSize="2xl" fontWeight={700} lineHeight="1">
                {stats.restrictedCount + stats.privateCount}
              </Text>
            </Box>

            <Box
              p={4}
              borderRadius={10}
              bg={{ base: "white", _dark: "gray.800" }}
              borderWidth="1px"
              borderColor={{ base: "gray.200", _dark: "gray.700" }}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Flex align="center" gap={2} mb={2} minH="32px">
                <Icon color="purple.500" fontSize="18px" flexShrink={0}>
                  <MdOutlinePeopleAlt />
                </Icon>
                <Text
                  fontSize="xs"
                  fontWeight={600}
                  color="gray.500"
                  lineHeight="short"
                >
                  TOTAL MEMBERS
                </Text>
              </Flex>
              <Text fontSize="2xl" fontWeight={700} lineHeight="1">
                {stats.totalMembers}
              </Text>
            </Box>
          </SimpleGrid>

          {/* Communities Management Card */}
          <Box
            p={5}
            borderRadius={10}
            bg={{ base: "white", _dark: "gray.800" }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
            shadow="sm"
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
              gap={3}
              mb={4}
            >
              <Heading fontSize="md">
                Communities ({filteredCommunities.length})
              </Heading>

              {/* Privacy filter buttons */}
              <HStack gap={1} wrap="wrap">
                {(["all", "public", "restricted", "private"] as const).map(
                  (type) => (
                    <Button
                      key={type}
                      size="xs"
                      variant={filterPrivacy === type ? "solid" : "outline"}
                      colorPalette={filterPrivacy === type ? "blue" : undefined}
                      onClick={() => setFilterPrivacy(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ),
                )}
              </HStack>
            </Flex>

            {/* Search Input */}
            <Flex align="center" position="relative" mb={4}>
              <Box position="absolute" left="12px" color="gray.400" zIndex={1}>
                <MdSearch size={20} />
              </Box>
              <Input
                placeholder="Search communities by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                pl="38px"
                borderRadius={8}
                fontSize="sm"
              />
            </Flex>

            {/* Communities list */}
            {loading && communities.length === 0 ? (
              <Stack gap={2}>
                <CommunityLoader />
                <CommunityLoader />
              </Stack>
            ) : filteredCommunities.length === 0 ? (
              <Box p={6} textAlign="center" color="gray.500">
                <Text fontSize="sm">
                  No communities match your current search or filter.
                </Text>
              </Box>
            ) : (
              <Stack gap={3}>
                {filteredCommunities.map((community) => (
                  <Flex
                    key={community.id}
                    justify="space-between"
                    align="center"
                    p={3}
                    borderRadius={8}
                    borderWidth="1px"
                    borderColor={{ base: "gray.200", _dark: "gray.700" }}
                    bg={{ base: "gray.50", _dark: "gray.900" }}
                    wrap="wrap"
                    gap={3}
                  >
                    <HStack gap={3}>
                      {community.imageURL ? (
                        <Image
                          src={community.imageURL}
                          alt={community.id}
                          boxSize="36px"
                          borderRadius="full"
                        />
                      ) : (
                        <Flex
                          boxSize="36px"
                          borderRadius="full"
                          bg="blue.500"
                          color="white"
                          align="center"
                          justify="center"
                          fontSize="20px"
                        >
                          <FaReddit />
                        </Flex>
                      )}
                      <Box>
                        <HStack gap={2}>
                          <Text fontWeight={600} fontSize="sm">
                            r/{community.id}
                          </Text>
                          <Badge
                            size="xs"
                            variant="subtle"
                            colorPalette={
                              community.privacyType === "private"
                                ? "red"
                                : community.privacyType === "restricted"
                                  ? "orange"
                                  : "green"
                            }
                          >
                            {community.privacyType || "public"}
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          {community.numberOfMembers || 0} members
                        </Text>
                      </Box>
                    </HStack>

                    <HStack gap={2}>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          router.push(ROUTES.COMMUNITY.detail(community.id))
                        }
                      >
                        <Icon mr={1}>
                          <MdOpenInNew />
                        </Icon>
                        View
                      </Button>
                      <Button
                        size="xs"
                        colorPalette="blue"
                        onClick={() => handleOpenSettings(community)}
                      >
                        <Icon mr={1}>
                          <MdSettings />
                        </Icon>
                        Settings
                      </Button>
                    </HStack>
                  </Flex>
                ))}
              </Stack>
            )}

            {/* Pagination Button */}
            {!noMoreCommunities ? (
              <Button
                mt={4}
                width="100%"
                variant="outline"
                size="sm"
                loading={loading}
                onClick={() => fetchCommunities(false)}
              >
                Load More
              </Button>
            ) : (
              <Text textAlign="center" mt={4} fontSize="xs" color="gray.500">
                All communities loaded
              </Text>
            )}
          </Box>
        </Stack>

        {/* Sidebar Column */}
        <Stack gap={4}>
          <Box
            p={4}
            borderRadius={10}
            bg={{ base: "white", _dark: "gray.800" }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
          >
            <Flex align="center" gap={2} mb={3}>
              <Icon color="blue.500" fontSize="20px">
                <MdOutlineSecurity />
              </Icon>
              <Heading fontSize="sm">Super Admin Session</Heading>
            </Flex>
            <Stack gap={2} fontSize="xs">
              <Box>
                <Text color="gray.500" fontWeight={600}>
                  AUTHENTICATED AS
                </Text>
                <Text fontWeight={600}>
                  {user.displayName || user.email || "Administrator"}
                </Text>
              </Box>
              <Box>
                <Text color="gray.500" fontWeight={600}>
                  ADMIN UID
                </Text>
                <Text
                  fontFamily="monospace"
                  fontSize="2xs"
                  wordBreak="break-all"
                >
                  {user.uid}
                </Text>
              </Box>
              <Box>
                <Text color="gray.500" fontWeight={600}>
                  SECURITY STATUS
                </Text>
                <Badge colorPalette="green" variant="solid" size="xs">
                  Active & Privileged
                </Badge>
              </Box>
            </Stack>
          </Box>

          <Box
            p={4}
            borderRadius={10}
            bg={{ base: "white", _dark: "gray.800" }}
            borderWidth="1px"
            borderColor={{ base: "gray.200", _dark: "gray.700" }}
          >
            <Heading fontSize="sm" mb={2}>
              Admin Privileges
            </Heading>
            <Stack
              gap={2}
              fontSize="xs"
              color={{ base: "gray.700", _dark: "gray.300" }}
            >
              <Text>• Full governance across all platform communities.</Text>
              <Text>• Update privacy, branding, and delete communities.</Text>
              <Text>• Manage community moderators and permissions.</Text>
              <Text>• Access and moderate restricted and private content.</Text>
            </Stack>
          </Box>
        </Stack>
      </PageContent>
    </>
  );
};

export default AdminPage;
