import { CheckboxCard, Flex, Icon, VStack } from "@chakra-ui/react";
import type { FC } from "react";
import type { IconType } from "react-icons";

type CommunityTypeOptionProps = {
  name: string;
  icon: IconType;
  label: string;
  description: string;
  isChecked: boolean;
  onChange: (value: string) => void;
};

/**
 * Single selectable option for community privacy type.
 * @param name - Value representing the type.
 * @param icon - Icon to display.
 * @param label - Human-readable label.
 * @param description - Short description of permissions.
 * @param isChecked - Whether this option is active.
 * @param onChange - Callback when the option is chosen.
 * @returns Checkbox-styled card for selection.
 */
const CommunityTypeOption: FC<CommunityTypeOptionProps> = ({
  name,
  icon,
  label,
  description,
  isChecked,
  onChange,
}) => {
  return (
    <CheckboxCard.Root
      value={name}
      checked={isChecked}
      onCheckedChange={() => onChange(name)}
      colorPalette="red"
      borderRadius="xl"
      cursor="pointer"
    >
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Content>
          <Flex align="center" gap={3}>
            <Icon
              as={icon}
              fontSize="24px"
              color={{ base: "gray.500", _dark: "gray.400" }}
            />
            <VStack align="start" gap={0}>
              <CheckboxCard.Label fontSize="10pt">{label}</CheckboxCard.Label>
              <CheckboxCard.Description fontSize="8pt">
                {description}
              </CheckboxCard.Description>
            </VStack>
          </Flex>
        </CheckboxCard.Content>
        <CheckboxCard.Indicator />
      </CheckboxCard.Control>
    </CheckboxCard.Root>
  );
};

export default CommunityTypeOption;
