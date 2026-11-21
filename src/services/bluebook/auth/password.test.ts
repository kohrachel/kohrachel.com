import { describe, expect, test } from "bun:test";
import { scryptSync } from "node:crypto";
import { hashPassword, needsRehash, verifyPassword } from "./password";

describe("password hashing", () => {
  test("checks the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).toStartWith("$scrypt$n=131072,r=8,p=1$");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(
      true,
    );
    expect(await verifyPassword("correct horse battery stapler", hash)).toBe(
      false,
    );
  });

  test("salts each hash differently", async () => {
    const [a, b] = await Promise.all([
      hashPassword("same password"),
      hashPassword("same password"),
    ]);
    expect(a).not.toBe(b);
  });

  test("treats differently composed accents as the same password", async () => {
    const hash = await hashPassword("café");
    expect(await verifyPassword("café", hash)).toBe(true);
  });

  test("rejects a stored value it can't read", async () => {
    expect(await verifyPassword("anything", "not a hash")).toBe(false);
    expect(needsRehash("not a hash")).toBe(true);
  });

  test("asks to redo hashes made with older settings", async () => {
    expect(needsRehash(await hashPassword("pw123456"))).toBe(false);
    expect(needsRehash("$scrypt$n=16384,r=8,p=1$c2FsdA$a2V5")).toBe(true);
  });

  test("still checks hashes made with older settings", async () => {
    const salt = Buffer.from("older salt");
    const key = scryptSync("pw123456", salt, 32, { N: 16384, r: 8, p: 1 });
    const older = `$scrypt$n=16384,r=8,p=1$${salt.toString("base64url")}$${key.toString("base64url")}`;
    expect(await verifyPassword("pw123456", older)).toBe(true);
    expect(await verifyPassword("pw1234567", older)).toBe(false);
  });
});
