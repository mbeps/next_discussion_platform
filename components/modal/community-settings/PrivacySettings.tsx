import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import type React from "react";
import { FiCheck } from "react-icons/fi";
import type { Community } from "@/types/community";

type PrivacySettingsProps = {
  currentCommunity: Community | null;
  selectedPrivacyType: string;
  handlePrivacyTypeChange: (details: { value: string }) => void;
};

const PRIVACY_TYPES = [
  {
    value: "public",
    label: "Public",
    description: "Everyone can view and post",
  },
  {
    value: "restricted",
    label: "Restricted",
    description: "Everyone can view, only members can post",
  },
  {
    value: "private",
    label: "Private",
    description: "Only members can view and post",
  },
];

/**
 * Component for managing community privacy settings
 */
const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  currentCommunity,
  selectedPrivacyType,
  handlePrivacyTypeChange,
}) => {
  const currentType =
    selectedPrivacyType || currentCommunity?.privacyType || "public";

  return (
    <Stack>
      <Text fontWeight={600} fontSize="12pt">
        Community Type
      </Text>
      <Stack gap={2}>
        {PRIVACY_TYPES.map((type) => {
          const isSelected = currentType === type.value;
          return (
            <Box
              key={type.value}
              p={3}
              border="1px solid"
              borderColor={isSelected ? "red.500" : "gray.200"}
              borderRadius="xl"
              cursor="pointer"
              onClick={() => handlePrivacyTypeChange({ value: type.value })}
              bg={
                isSelected
                  ? { base: "red.50", _dark: "red.900" }
                  : "transparent"
              }
              _hover={{
                borderColor: "red.300",
              }}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight={500} fontSize="10pt">
                    {type.label}
                  </Text>
                  <Text
                    fontSize="8pt"
                    color={{ base: "gray.500", _dark: "gray.400" }}
                  >
                    {type.description}
                  </Text>
                </Box>
                {isSelected && (
                  <Box color="red.500">
                    <FiCheck size={20} />
                  </Box>
                )}
              </Flex>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default PrivacySettings;
