/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { Provider, useAtomValue, useSetAtom, createStore } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  pathname: vi.fn<[], string>(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => mocks.pathname(),
}));

import { defaultMenuItem, directoryMenuAtom } from "@/atoms/directoryMenuAtom";
import { communityStateAtom } from "@/atoms/communitiesAtom";
import useDirectory from "@/hooks/useDirectory";
import { Community } from "@/types/community";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

const community = (over: Partial<Community> = {}): Community => ({
  id: "c1",
  creatorId: "creator",
  numberOfMembers: 5,
  privacyType: "public",
  ...over,
});

function useSeeds() {
  const setDirectory = useSetAtom(directoryMenuAtom);
  const setCommunity = useSetAtom(communityStateAtom);
  return {
    openMenu: () => setDirectory((prev) => ({ ...prev, isOpen: true })),
    selectItem: (displayText: string) =>
      setDirectory((prev) => ({
        ...prev,
        selectedMenuItem: { ...defaultMenuItem, displayText },
      })),
    setCurrent: (current?: Community) =>
      setCommunity((prev) => ({ ...prev, currentCommunity: current })),
  };
}

const menuItem = {
  displayText: "Home",
  link: "/",
  icon: expect.anything(),
  iconColor: expect.anything(),
};

describe("useDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = createStore();
    mocks.pathname.mockReturnValue("/");
  });

  it("starts with the default menu state", () => {
    const { result } = renderHook(() => useDirectory(), { wrapper });
    expect(result.current.directoryState).toEqual({
      isOpen: false,
      selectedMenuItem: defaultMenuItem,
    });
  });

  it("toggleMenuOpen flips isOpen both ways", () => {
    const { result } = renderHook(() => useDirectory(), { wrapper });
    act(() => result.current.toggleMenuOpen());
    expect(result.current.directoryState.isOpen).toBe(true);
    act(() => result.current.toggleMenuOpen());
    expect(result.current.directoryState.isOpen).toBe(false);
  });

  it("setDirectoryOpen sets an explicit value", () => {
    const { result } = renderHook(() => useDirectory(), { wrapper });
    act(() => result.current.setDirectoryOpen(true));
    expect(result.current.directoryState.isOpen).toBe(true);
  });

  it("onSelectMenuItem sets the item and pushes its link", () => {
    const { result } = renderHook(() => useDirectory(), { wrapper });
    const item = { ...menuItem, link: "/communities" };
    act(() => result.current.onSelectMenuItem(item));
    expect(result.current.directoryState.selectedMenuItem).toEqual(item);
    expect(mocks.push).toHaveBeenCalledWith("/communities");
  });

  it("onSelectMenuItem closes the menu when it was open", () => {
    const seeds = renderHook(() => useSeeds(), { wrapper }).result.current;
    act(() => seeds.openMenu());
    const { result } = renderHook(() => useDirectory(), { wrapper });
    act(() => result.current.onSelectMenuItem({ ...menuItem, link: "/x" }));
    expect(result.current.directoryState.isOpen).toBe(false);
  });

  it("onSelectMenuItem keeps menu closed state when already closed", () => {
    const { result } = renderHook(() => useDirectory(), { wrapper });
    act(() => result.current.onSelectMenuItem({ ...menuItem, link: "/x" }));
    expect(result.current.directoryState.isOpen).toBe(false);
  });

  it("syncs selected item to the community when inside one on a community page", () => {
    mocks.pathname.mockReturnValue("/community/c1");
    const seeds = renderHook(() => useSeeds(), { wrapper }).result.current;
    act(() => seeds.setCurrent(community({ imageURL: "img.png" })));
    const { result } = renderHook(() => useDirectory(), { wrapper });
    expect(result.current.directoryState.selectedMenuItem).toMatchObject({
      displayText: "c1",
      link: "community/c1",
      imageURL: "img.png",
    });
  });

  it("resets to the default item on the home page even with a current community", () => {
    mocks.pathname.mockReturnValue("/");
    const seeds = renderHook(() => useSeeds(), { wrapper }).result.current;
    act(() => seeds.selectItem("Other"));
    act(() => seeds.setCurrent(community()));
    const { result } = renderHook(() => useDirectory(), { wrapper });
    expect(result.current.directoryState.selectedMenuItem).toEqual(
      defaultMenuItem,
    );
  });

  it("sets Communities item when on /communities even with a current community", () => {
    mocks.pathname.mockReturnValue("/communities");
    const seeds = renderHook(() => useSeeds(), { wrapper }).result.current;
    act(() => seeds.setCurrent(community()));
    const { result } = renderHook(() => useDirectory(), { wrapper });
    expect(result.current.directoryState.selectedMenuItem).toMatchObject({
      displayText: "Communities",
      link: "/communities",
    });
  });

  it("resets to defaultMenuItem when navigating back home", () => {
    mocks.pathname.mockReturnValue("/communities");
    const seeds = renderHook(() => useSeeds(), { wrapper }).result.current;
    act(() => seeds.selectItem("Other"));
    const { result, rerender } = renderHook(() => useDirectory(), { wrapper });
    expect(result.current.directoryState.selectedMenuItem.displayText).toBe(
      "Communities",
    );
    mocks.pathname.mockReturnValue("/");
    rerender();
    expect(result.current.directoryState.selectedMenuItem).toEqual(
      defaultMenuItem,
    );
  });

  it("leaves selection untouched when no community and unknown path", () => {
    mocks.pathname.mockReturnValue("/submit");
    const seeds = renderHook(() => useSeeds(), { wrapper }).result.current;
    act(() => seeds.selectItem("Custom"));
    const { result } = renderHook(() => useDirectory(), { wrapper });
    expect(result.current.directoryState.selectedMenuItem.displayText).toBe(
      "Custom",
    );
  });

  it("shares atom state across separate hook instances via the same store", () => {
    const a = renderHook(() => useDirectory(), { wrapper });
    const b = renderHook(() => useDirectory(), { wrapper });
    act(() => b.result.current.toggleMenuOpen());
    expect(a.result.current.directoryState.isOpen).toBe(true);
  });
});
