import { Button, Image } from "@chakra-ui/react";
import type React from "react";

interface AuthButtonProps {
  provider: string;
  loading: boolean;
  onClick: () => void;
  image: string;
}

/**
 * OAuth provider button used in the auth modal.
 * @param provider - Provider label shown on the button.
 * @param loading - Shows spinner while sign-in is pending.
 * @param onClick - Handler to trigger provider flow.
 * @param image - Logo displayed beside the label.
 * @returns Styled button for third-party auth.
 */
const AuthButton: React.FC<AuthButtonProps> = ({
  provider,
  loading,
  onClick,
  image,
}) => {
  return (
    <Button
      flexGrow={1}
      variant={"oauth" as any}
      loading={loading}
      onClick={onClick}
      width="50%"
    >
      <Image
        src={image}
        alt={`Continue with ${provider}`}
        mr={2}
        height="20px"
      />
      {provider}
    </Button>
  );
};

export default AuthButton;
