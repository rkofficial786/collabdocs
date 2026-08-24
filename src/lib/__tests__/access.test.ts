import { describe, it, expect } from "vitest";
import { resolveRole, canEdit } from "@/lib/access";

const doc = { ownerId: "owner-1" };

describe("resolveRole", () => {
  it("grants owner role to the document's owner", () => {
    expect(resolveRole(doc, [], "owner-1")).toBe("owner");
  });

  it("grants edit role from an EDIT share", () => {
    const shares = [{ userId: "u2", permission: "EDIT" as const }];
    expect(resolveRole(doc, shares, "u2")).toBe("edit");
  });

  it("grants view role from a VIEW share", () => {
    const shares = [{ userId: "u3", permission: "VIEW" as const }];
    expect(resolveRole(doc, shares, "u3")).toBe("view");
  });

  it("denies access to a user with no share and no ownership", () => {
    const shares = [{ userId: "u2", permission: "EDIT" as const }];
    expect(resolveRole(doc, shares, "stranger")).toBeNull();
  });

  it("denies access when there is no user id", () => {
    expect(resolveRole(doc, [], undefined)).toBeNull();
    expect(resolveRole(doc, [], null)).toBeNull();
  });
});

describe("canEdit", () => {
  it("allows owners and editors", () => {
    expect(canEdit("owner")).toBe(true);
    expect(canEdit("edit")).toBe(true);
  });

  it("denies viewers and unauthenticated users", () => {
    expect(canEdit("view")).toBe(false);
    expect(canEdit(null)).toBe(false);
  });
});
