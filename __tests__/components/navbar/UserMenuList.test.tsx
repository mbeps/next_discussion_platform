/// <reference types="vitest" />
import { ChakraProvider, MenuPositioner, MenuRoot } from "@chakra-ui/react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { User } from "firebase/auth";
import { Provider } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { theme } from "@/chakra/theme";
import UserMenuList from "@/components/navbar/right-content/user-menu/UserMenuList";
import { ROUTES } from "@/config/routes";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  signOut: vi.fn(),
  isSuperAdmin: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock("firebase/auth", () => ({
  signOut: mocks.signOut,
}));

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
}));

vi.mock("@/lib/community/communityPermissions", () => ({
  isSuperAdmin: mocks.isSuperAdmin,
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider>
    <ChakraProvider value={theme}>
      <MenuRoot open={true}>
        <MenuPositioner>{children}</MenuPositioner>
      </MenuRoot>
    </ChakraProvider>
  </Provider>
);

describe("UserMenuList", () => {
  const setProfileModalOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSuperAdmin.mockReturnValue(false);
  });

  it("renders Log In / Sign Up option when unauthenticated and does not show Admin", () => {
    render(
      <UserMenuList user={null} setProfileModalOpen={setProfileModalOpen} />,
      { wrapper },
    );

    expect(screen.getByText("Log In / Sign Up")).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("renders Profile and Log Out for regular authenticated user without Admin option", () => {
    const regularUser = { uid: "user-123" } as User;
    mocks.isSuperAdmin.mockReturnValue(false);

    render(
      <UserMenuList
        user={regularUser}
        setProfileModalOpen={setProfileModalOpen}
      />,
      { wrapper },
    );

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    expect(mocks.isSuperAdmin).toHaveBeenCalledWith("user-123");
  });

  it("renders Admin option for global super admin user and navigates to /admin on click", () => {
    const superAdminUser = { uid: "super-admin-uid" } as User;
    mocks.isSuperAdmin.mockReturnValue(true);

    render(
      <UserMenuList
        user={superAdminUser}
        setProfileModalOpen={setProfileModalOpen}
      />,
      { wrapper },
    );

    expect(screen.getByText("Profile")).toBeInTheDocument();
    const adminButton = screen.getByText("Admin");
    expect(adminButton).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();

    act(() => {
      fireEvent.click(adminButton);
    });
    expect(mocks.push).toHaveBeenCalledWith(ROUTES.ADMIN.path);
  });
});
