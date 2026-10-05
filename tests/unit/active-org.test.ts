import { describe, expect, it } from "vitest";
import { pickActiveOrg, safeNextPath, type Membership } from "@/lib/auth/active-org";

const a: Membership = { orgId: "org-a", orgName: "A", role: "owner", isDemoSandbox: false };
const b: Membership = { orgId: "org-b", orgName: "B", role: "reviewer", isDemoSandbox: true };

describe("pickActiveOrg", () => {
  it("uses the cookie org when the user belongs to it", () => {
    expect(pickActiveOrg([a, b], "org-b")).toBe(b);
  });

  it("falls back to the first org when the cookie names an org the user isn't in", () => {
    expect(pickActiveOrg([a, b], "org-someone-else")).toBe(a);
  });

  it("falls back to the first org without a cookie", () => {
    expect(pickActiveOrg([a, b], undefined)).toBe(a);
  });

  it("returns null with no memberships", () => {
    expect(pickActiveOrg([], "org-a")).toBeNull();
  });
});

describe("safeNextPath", () => {
  it.each([
    ["/app/contracts", "/app/contracts"],
    ["/app?tab=ask", "/app?tab=ask"],
  ])("keeps relative path %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it.each([null, undefined, "", "https://evil.example", "//evil.example", "/\\evil.example", "app"])(
    "rejects %s",
    (input) => {
      expect(safeNextPath(input)).toBe("/app");
    },
  );
});
