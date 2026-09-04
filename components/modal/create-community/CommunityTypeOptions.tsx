import { VStack } from "@chakra-ui/react";
import type React from "react";
import CommunityTypeOption from "./CommunityTypeOption";

interface CommunityTypeOptionsProps {
  options: {
    name: string;
    icon: any;
    label: string;
    description: string;
  }[];
  communityType: string;
  onCommunityTypeChange: (value: string) => void;
}

/**
 * Renders radio-like options for selecting community privacy.
 * @param options - Available types with labels and descriptions.
 * @param communityType - Currently selected type.
 * @param onCommunityTypeChange - Handler to update the selection.
 * @returns Vertical stack of selectable options.
 */
const CommunityTypeOptions: React.FC<CommunityTypeOptionsProps> = ({
  options,
  communityType,
  onCommunityTypeChange,
}) => {
  return (
    // add top margin to increase gap between the title and options
    <VStack mt={6} gap={3} align="stretch">
      {options.map((option) => (
        <CommunityTypeOption
          key={option.name}
          name={option.name}
          icon={option.icon}
          label={option.label}
          description={option.description}
          isChecked={communityType === option.name}
          onChange={onCommunityTypeChange}
        />
      ))}
    </VStack>
  );
};

export default CommunityTypeOptions;
