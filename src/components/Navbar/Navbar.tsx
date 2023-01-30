 import { Flex, Image } from '@chakra-ui/react';
import React from 'react';
import SearchInput from './SearchInput';
 
 const Navbar:React.FC = () => {
	
	return (
		<Flex bg="white" height="44px" padding="6px 12px">
		  <Flex align="center">
			<Image src="/images/logo.svg" height="30px" alt="Website logo"/>
			
			{/* When screen size is mobile, SVG bellow is not displayed */}
			<Image
			  src="/images/logo_text.svg"
			  height="46px"
			  display={{ base: "none", md: "unset" }} 
			  alt="Website text logo"
			/>
		  </Flex>
		  <SearchInput />
		  {/* <Directory/> 
		  <RightContent user={user}/> */}
		</Flex>
	  );
 }
 export default Navbar;