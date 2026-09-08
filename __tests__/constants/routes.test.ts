import { describe, expect, it } from "vitest";
import { ROUTES } from "@/constants/routes";

describe("ROUTES", () => {
  it("returns the correct static routes", () => {
    expect(ROUTES.HOME.path).toBe("/");
    expect(ROUTES.COMMUNITIES.path).toBe("/communities");
    expect(ROUTES.COMMUNITY.path).toBe("/community");
  });

  it("builds dynamic community routes", () => {
    expect(ROUTES.COMMUNITY.detail("react")).toBe("/community/react");
    expect(ROUTES.COMMUNITY.submit("react")).toBe("/community/react/submit");
    expect(ROUTES.COMMUNITY.post("react", "post123")).toBe(
      "/community/react/comments/post123",
    );
  });
});

