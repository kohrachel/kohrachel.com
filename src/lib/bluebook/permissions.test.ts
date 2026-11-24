import { describe, expect, test } from "bun:test";
import { canDeleteItem, canEditEntry, isElevated } from "./permissions";

const owner = { id: 1, role: "owner" as const };
const admin = { id: 2, role: "admin" as const };
const member = { id: 3, role: "member" as const };

describe("permissions", () => {
  test("owners and admins are elevated, members aren't", () => {
    expect([owner, admin, member].map(isElevated)).toEqual([true, true, false]);
  });

  test("members edit only their own entries; owners and admins edit anyone's", () => {
    expect(canEditEntry(member, 3)).toBe(true);
    expect(canEditEntry(member, 1)).toBe(false);
    expect(canEditEntry(owner, 3)).toBe(true);
    expect(canEditEntry(admin, 3)).toBe(true);
  });

  test("members delete only items they alone logged", () => {
    expect(canDeleteItem(member, [3, 3])).toBe(true);
    expect(canDeleteItem(member, [3, 1])).toBe(false);
    expect(canDeleteItem(admin, [3, 1])).toBe(true);
    expect(canDeleteItem(owner, [3])).toBe(true);
  });
});
