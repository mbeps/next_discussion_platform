/// <reference types="vitest" />
import { act, renderHook } from "@testing-library/react";
import { Provider, createStore, useAtomValue } from "jotai";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuthState: vi.fn(),
  push: vi.fn(),
  toggleMenuOpen: vi.fn(),
}));

vi.mock("react-firebase-hooks/auth", () => ({
  useAuthState: mocks.useAuthState,
}));

vi.mock("@/firebase/clientApp", () => ({
  auth: {},
  firestore: {},
  storage: {},
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useParams: () => ({}),
  usePathname: () => "/",
}));

vi.mock("@/hooks/useDirectory", () => ({
  default: () => ({ toggleMenuOpen: mocks.toggleMenuOpen }),
}));

import { authModalStateAtom } from "@/atoms/authModalAtom";
import useCallCreatePost from "@/hooks/posts/useCallCreatePost";

let store: ReturnType<typeof createStore>;
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

beforeEach(() => {
  vi.clearAllMocks();
  store = createStore();
});

describe("useCallCreatePost", () => {
  it("opens the login modal when logged out", () => {
    mocks.useAuthState.mockReturnValue([null, false, undefined]);
    const { result } = renderHook(() => useCallCreatePost(), { wrapper });
    act(() => {
      result.current.onClick();
    });
    expect(store.get(authModalStateAtom)).toEqual({
      open: true,
      view: "login",
    });
    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.toggleMenuOpen).not.toHaveBeenCalled();
  });

  it("toggles the directory menu when logged in without a community param", () => {
    mocks.useAuthState.mockReturnValue([{ uid: "u1" }, false, undefined]);
    const { result } = renderHook(() => useCallCreatePost(), { wrapper });
    act(() => {
      result.current.onClick();
    });
    expect(mocks.toggleMenuOpen).toHaveBeenCalled();
    expect(store.get(authModalStateAtom).open).toBe(false);
  });
});
