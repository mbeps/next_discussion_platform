/// <reference types="vitest" />
import { ChakraProvider } from "@chakra-ui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/admin/page";
import { theme } from "@/chakra/theme";
import { ROUTES } from "@/config/routes";
import type { Community } from "@/types/community";

const mocks = vi.hoisted(() => ({
  user: null as any,
  loadingAuth: false,
  replace: vi.fn(),
  push: vi.fn(),
  isSuperAdmin: vi.fn(),
  fetchCommunities: vi.fn(),
  communities: [] as Community[],
  loadingFeed: false,
  noMoreCommunities: false,
}));

vi.mock("react-firebase-hooks/auth", () => ({
  useAuthState: () => [mocks.user, mocks.loadingAuth],
}));

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
    push: mocks.push,
  }),
}));

vi.mock("@/lib/community/communityPermissions", () => ({
  isSuperAdmin: mocks.isSuperAdmin,
}));

vi.mock("@/hooks/community/useCommunitiesFeed", () => ({
  default: () => ({
    communities: mocks.communities,
    loading: mocks.loadingFeed,
    fetchCommunities: mocks.fetchCommunities,
    noMoreCommunities: mocks.noMoreCommunities,
  }),
}));

vi.mock(
  "@/components/modal/community-settings/CommunitySettings",
  () => ({
    default: ({
      open,
      communityData,
    }: { open: boolean; communityData: Community }) =>
      open ? (
        <div data-testid="community-settings-modal">
          Settings for {communityData.id}
        </div>
      ) : null,
  }),
);

const wrapper = ({ children }: { children: ReactNode }) => (
  <ChakraProvider value={theme}>{children}</ChakraProvider>
);

describe("Admin Page (/admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = null;
    mocks.loadingAuth = false;
    mocks.isSuperAdmin.mockReturnValue(false);
    mocks.communities = [
      {
        id: "public-comm",
        privacyType: "public",
        numberOfMembers: 12,
        creatorId: "user-1",
      } as Community,
      {
        id: "private-comm",
        privacyType: "private",
        numberOfMembers: 4,
        creatorId: "user-2",
      } as Community,
    ];
  });

  it("shows loader while authentication state is loading", () => {
    mocks.loadingAuth = true;
    render(<AdminPage />, { wrapper });

    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated users to home route and renders nothing", () => {
    mocks.loadingAuth = false;
    mocks.user = null;

    render(<AdminPage />, { wrapper });

    expect(mocks.replace).toHaveBeenCalledWith(ROUTES.HOME.path);
    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
  });

  it("redirects regular authenticated non-admin users to home route and renders nothing", () => {
    mocks.loadingAuth = false;
    mocks.user = { uid: "regular-user-uid", email: "user@example.com" };
    mocks.isSuperAdmin.mockReturnValue(false);

    render(<AdminPage />, { wrapper });

    expect(mocks.replace).toHaveBeenCalledWith(ROUTES.HOME.path);
    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
  });

  it("renders Admin Dashboard with metrics and community controls for super admin", () => {
    mocks.loadingAuth = false;
    mocks.user = {
      uid: "super-admin-uid",
      email: "admin@platform.com",
      displayName: "Platform Admin",
    };
    mocks.isSuperAdmin.mockReturnValue(true);

    render(<AdminPage />, { wrapper });

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByText("r/public-comm")).toBeInTheDocument();
    expect(screen.getByText("r/private-comm")).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("allows navigating to community detail on View button click", () => {
    mocks.loadingAuth = false;
    mocks.user = { uid: "super-admin-uid" };
    mocks.isSuperAdmin.mockReturnValue(true);

    render(<AdminPage />, { wrapper });

    const viewButtons = screen.getAllByRole("button", { name: /view/i });
    expect(viewButtons.length).toBeGreaterThan(0);

    fireEvent.click(viewButtons[0]);
    expect(mocks.push).toHaveBeenCalledWith(
      ROUTES.COMMUNITY.detail("public-comm"),
    );
  });

  it("allows opening community settings modal on Settings button click", () => {
    mocks.loadingAuth = false;
    mocks.user = { uid: "super-admin-uid" };
    mocks.isSuperAdmin.mockReturnValue(true);

    render(<AdminPage />, { wrapper });

    const settingsButtons = screen.getAllByRole("button", {
      name: /settings/i,
    });
    expect(settingsButtons.length).toBeGreaterThan(0);

    fireEvent.click(settingsButtons[0]);
    expect(screen.getByTestId("community-settings-modal")).toBeInTheDocument();
    expect(
      screen.getByText("Settings for public-comm"),
    ).toBeInTheDocument();
  });

  it("filters communities when typing in the search box", () => {
    mocks.loadingAuth = false;
    mocks.user = { uid: "super-admin-uid" };
    mocks.isSuperAdmin.mockReturnValue(true);

    render(<AdminPage />, { wrapper });

    expect(screen.getByText("r/public-comm")).toBeInTheDocument();
    expect(screen.getByText("r/private-comm")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search communities/i);
    fireEvent.change(searchInput, { target: { value: "private" } });

    expect(screen.queryByText("r/public-comm")).not.toBeInTheDocument();
    expect(screen.getByText("r/private-comm")).toBeInTheDocument();
  });
});

