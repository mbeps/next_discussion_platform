/// <reference types="vitest" />

import { act, renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

let triggerIntersection: ((isIntersecting: boolean) => void) | undefined;
let lastObserver: IntersectionObserverMock | undefined;

class IntersectionObserverMock {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    lastObserver = this;
    triggerIntersection = (isIntersecting: boolean) =>
      callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
  }
}

describe("useIntersectionObserver", () => {
  beforeAll(() => {
    (
      global as unknown as { IntersectionObserver: typeof IntersectionObserver }
    ).IntersectionObserver =
      IntersectionObserverMock as unknown as typeof IntersectionObserver;
  });

  beforeEach(() => {
    triggerIntersection = undefined;
    lastObserver = undefined;
  });

  it("observes the element and updates when it enters or leaves the viewport", async () => {
    const target = document.createElement("div");
    const { result, unmount } = renderHook(() => {
      const hook = useIntersectionObserver();
      (hook.ref as any).current = target;
      return hook;
    });

    await waitFor(() => {
      expect(lastObserver?.observe).toHaveBeenCalledWith(target);
      expect(triggerIntersection).toBeDefined();
    });

    act(() => {
      triggerIntersection?.(true);
    });
    expect(result.current.isIntersecting).toBe(true);

    act(() => {
      triggerIntersection?.(false);
    });
    expect(result.current.isIntersecting).toBe(false);

    act(() => {
      unmount();
    });
    expect(lastObserver?.unobserve).toHaveBeenCalledWith(target);
  });

  it("does not register the observer when there is no target ref", () => {
    renderHook(() => useIntersectionObserver());

    expect(lastObserver?.observe).not.toHaveBeenCalled();
    expect(lastObserver?.unobserve).not.toHaveBeenCalled();
  });
});
