import { Flex, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { FormTab } from "./NewPostForm";

/**
 * TabItem component for displaying tabs at the top of the NewPostForm.
 * @param {FormTab} item - FormTab object from NewPostForm
 * @param {boolean} selected - whether the tab is selected or not
 * @param {function} setSelectedTab - selecting a tab
 */
type TabItemProps = {
  item: FormTab;
  selected: boolean;
  setSelectedTab: (value: string) => void;
};

/**
 * Displays tab buttons at the top of the NewPostForm.
 * Allows the user to select a tab to display the form for that tab.
 * @param {FormTab} item - FormTab object from NewPostForm
 * @param {boolean} selected - whether the tab is selected or not
 * @param {() => {}} setSelectedTab - selecting a tab
 *
 * @returns {React.FC<TabItemProps>} - TabItem component for NewPostForm
 */
const TabItem: React.FC<TabItemProps> = ({
  item,
  selected,
  setSelectedTab,
}) => {
  return (
    <Flex
      justify="center"
      align="center"
      fontWeight={800}
      fontSize="16pt"
      flexGrow={1}
      width={0} // split icons evenly
      p="14px 0px"
      cursor="pointer"
      _hover={{ bg: "gray.50", boxShadow: "lg" }}
      color={selected ? "red.500" : "gray.500"}
      borderWidth="1px"
      borderColor={selected ? "red.500" : "gray.200"}
      borderRadius={10}
      onClick={() => setSelectedTab(item.title)}
      shadow="md"
    >
      <Flex align="center" height="20px" mr={2}>
        <Icon as={item.icon} />
      </Flex>
      <Text fontSize="10pt">{item.title}</Text>
    </Flex>
  );
};
export default TabItem;
