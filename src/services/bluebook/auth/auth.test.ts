import { beforeEach, describe, expect, test } from "bun:test";
import { sql } from "drizzle-orm";

// Runs only against a local test database: TEST_DATABASE_URL, with the
// bluebook migrations applied. See src/test/setup.ts.
const hasDatabase = !!process.env.TEST_DATABASE_URL;

const { db } = hasDatabase ? await import("@/db") : { db: null! };
const { inviteService } = await import("./invite");
const { findSetupLinkService, finishSetupService } = await import("./setup");
const { signInService } = await import("./sign-in");
const {
  changePasswordService,
  updateProfileService,
  usernameAvailableService,
} = await import("./account");
const {
  createSessionService,
  deleteSessionService,
  findDevUserService,
  findSessionUserService,
  refreshSessionService,
} = await import("./sessions");

type Row = Record<string, unknown>;
const rows = async (query: ReturnType<typeof sql>) =>
  (await db.execute<Row>(query)).rows;

const PASSWORD = "a long enough password";

async function setUp(email: string, username: string, password = PASSWORD) {
  const { token } = await inviteService(email);
  const result = await finishSetupService(token, {
    username,
    displayName: username,
    password,
    confirmPassword: password,
  });
  if (!result.ok) throw new Error(result.error);
  return result;
}

describe.skipIf(!hasDatabase)("bluebook accounts", () => {
  beforeEach(async () => {
    await db.execute(sql`truncate bluebook.users restart identity cascade`);
  });

  describe("invites and setup links", () => {
    test("adds an invited user with a link and nothing else set", async () => {
      const invite = await inviteService("  Friend@Example.com ");
      expect(invite).toMatchObject({
        created: true,
        needsProfile: true,
        disabled: false,
      });
      expect(
        await rows(sql`
          select email, username, password_hash, role
          from bluebook.users`),
      ).toEqual([
        {
          email: "friend@example.com",
          username: null,
          password_hash: null,
          role: "member",
        },
      ]);
      expect(await findSetupLinkService(invite.token)).toEqual({
        needsProfile: true,
        suggestedUsername: "friend",
        suggestedDisplayName: "friend",
      });
    });

    test("a new link replaces the old one", async () => {
      const first = await inviteService("friend@example.com");
      const second = await inviteService("friend@example.com");
      expect(second.created).toBe(false);
      expect(await findSetupLinkService(first.token)).toBeNull();
      expect(await findSetupLinkService(second.token)).not.toBeNull();
    });

    test("expired links and disabled users' links don't work", async () => {
      const expired = await inviteService("a@example.com");
      await db.execute(sql`
        update bluebook.users set setup_token_expires_at = now() - interval '1 second'
        where email = 'a@example.com'`);
      const disabled = await inviteService("b@example.com");
      await db.execute(sql`
        update bluebook.users set disabled_at = now() where email = 'b@example.com'`);

      expect(await findSetupLinkService(expired.token)).toBeNull();
      expect(await findSetupLinkService(disabled.token)).toBeNull();
      expect(
        await finishSetupService(expired.token, {
          username: "a",
          displayName: "A",
          password: PASSWORD,
          confirmPassword: PASSWORD,
        }),
      ).toMatchObject({ ok: false });
    });

    test("finishing setup saves the profile, uses up the link and signs in", async () => {
      const { token } = await inviteService("friend@example.com");
      const result = await finishSetupService(token, {
        username: "Friend_1",
        displayName: "My Friend",
        password: PASSWORD,
        confirmPassword: PASSWORD,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(await findSetupLinkService(token)).toBeNull();
      expect(await findSessionUserService(result.token)).toEqual({
        id: 1,
        username: "Friend_1",
        displayName: "My Friend",
        role: "member",
      });
    });

    test("a first-time setup needs a username and display name", async () => {
      const { token } = await inviteService("friend@example.com");
      expect(
        await finishSetupService(token, {
          password: PASSWORD,
          confirmPassword: PASSWORD,
        }),
      ).toEqual({ ok: false, error: "Pick a username and display name." });
    });

    test("usernames are unique ignoring case", async () => {
      await setUp("a@example.com", "Rachel");
      const { token } = await inviteService("b@example.com");
      expect(
        await finishSetupService(token, {
          username: "rachel",
          displayName: "Someone else",
          password: PASSWORD,
          confirmPassword: PASSWORD,
        }),
      ).toEqual({ ok: false, error: "That username is taken." });
      expect(await findSetupLinkService(token)).not.toBeNull();
    });

    test("a password reset keeps the profile and signs out other devices", async () => {
      const first = await setUp(
        "friend@example.com",
        "friend",
        "old password!",
      );
      const reset = await inviteService("friend@example.com");
      expect(reset).toMatchObject({ created: false, needsProfile: false });
      expect(await findSetupLinkService(reset.token)).toMatchObject({
        needsProfile: false,
      });

      const result = await finishSetupService(reset.token, {
        username: "ignored",
        displayName: "Ignored",
        password: "new password!",
        confirmPassword: "new password!",
      });
      expect(result.ok).toBe(true);
      expect(await findSessionUserService(first.token)).toBeNull();
      expect(
        await rows(sql`select username, display_name from bluebook.users`),
      ).toEqual([{ username: "friend", display_name: "friend" }]);
      expect(await signInService("friend", "old password!")).toEqual({
        ok: false,
      });
      expect(await signInService("friend", "new password!")).toEqual({
        ok: true,
        userId: 1,
      });
    });
  });

  describe("signing in", () => {
    test("works with the username in any case, or the email", async () => {
      await setUp("friend@example.com", "Friend");
      expect(await signInService("FRIEND", PASSWORD)).toEqual({
        ok: true,
        userId: 1,
      });
      expect(await signInService("Friend@Example.com ", PASSWORD)).toEqual({
        ok: true,
        userId: 1,
      });
    });

    test("fails the same way for a wrong password, unknown, unfinished or disabled account", async () => {
      await setUp("friend@example.com", "friend");
      await inviteService("pending@example.com");
      await setUp("gone@example.com", "gone");
      await db.execute(sql`
        update bluebook.users set disabled_at = now() where email = 'gone@example.com'`);

      for (const [login, password] of [
        ["friend", "wrong password"],
        ["nobody", PASSWORD],
        ["pending@example.com", PASSWORD],
        ["gone", PASSWORD],
      ]) {
        expect(await signInService(login, password)).toEqual({ ok: false });
      }
    });

    test("10 wrong passwords in a row lock the account for 15 minutes", async () => {
      await setUp("friend@example.com", "friend");
      for (let attempt = 0; attempt < 9; attempt++) {
        await signInService("friend", "wrong password");
      }
      expect(
        await rows(
          sql`select failed_sign_ins, locked_until from bluebook.users`,
        ),
      ).toEqual([{ failed_sign_ins: 9, locked_until: null }]);

      await signInService("friend", "wrong password");
      expect(await signInService("friend", PASSWORD)).toEqual({ ok: false });
      expect(
        await rows(sql`
          select failed_sign_ins,
                 locked_until between now() + interval '14 minutes'
                                  and now() + interval '15 minutes' as locked
          from bluebook.users`),
      ).toEqual([{ failed_sign_ins: 0, locked: true }]);

      await db.execute(sql`
        update bluebook.users set locked_until = now() - interval '1 second'`);
      expect(await signInService("friend", PASSWORD)).toEqual({
        ok: true,
        userId: 1,
      });
    }, 30_000);

    test("a successful sign-in resets the wrong-password count", async () => {
      await setUp("friend@example.com", "friend");
      await signInService("friend", "wrong password");
      await signInService("friend", PASSWORD);
      expect(
        await rows(sql`select failed_sign_ins from bluebook.users`),
      ).toEqual([{ failed_sign_ins: 0 }]);
    });
  });

  describe("sessions", () => {
    test("stores only a hash of the token", async () => {
      const { token } = await setUp("friend@example.com", "friend");
      const stored = await rows(sql`select token_hash from bluebook.sessions`);
      expect(stored).toHaveLength(1);
      expect(stored[0].token_hash).not.toBe(token);
    });

    test("stop working once expired, deleted, or the user is disabled", async () => {
      await setUp("friend@example.com", "friend");
      const expired = await createSessionService(1);
      const deleted = await createSessionService(1);
      const kept = await createSessionService(1);
      await db.execute(sql`
        update bluebook.sessions set expires_at = now() - interval '1 second'
        where id = 2`);
      await deleteSessionService(deleted.token);

      expect(await findSessionUserService(expired.token)).toBeNull();
      expect(await findSessionUserService(deleted.token)).toBeNull();
      expect(await findSessionUserService(kept.token)).not.toBeNull();
      expect(await findSessionUserService("made up")).toBeNull();

      await db.execute(sql`update bluebook.users set disabled_at = now()`);
      expect(await findSessionUserService(kept.token)).toBeNull();
    });

    test("last 400 days, pushed out at most once a day", async () => {
      const { token } = await setUp("friend@example.com", "friend");
      expect(
        await rows(sql`
          select expires_at between now() + interval '399 days'
                                and now() + interval '401 days' as about_400_days
          from bluebook.sessions`),
      ).toEqual([{ about_400_days: true }]);

      expect(await refreshSessionService(token)).toBeNull();

      await db.execute(sql`
        update bluebook.sessions
        set last_used_at = now() - interval '2 days',
            expires_at = now() + interval '10 days'`);
      const refreshed = await refreshSessionService(token);
      expect(refreshed).toBeInstanceOf(Date);
      expect(refreshed!.getTime()).toBeGreaterThan(
        Date.now() + 399 * 24 * 60 * 60 * 1000,
      );
    });
  });

  describe("acting as someone in next dev", () => {
    test("defaults to the owner, or picks a user by username", async () => {
      await setUp("friend@example.com", "friend");
      await setUp("me@example.com", "me");
      await db.execute(sql`
        update bluebook.users set role = 'owner' where email = 'me@example.com'`);

      expect(await findDevUserService(undefined)).toMatchObject({
        username: "me",
        role: "owner",
      });
      expect(await findDevUserService("FRIEND")).toMatchObject({
        username: "friend",
        role: "member",
      });
      expect(await findDevUserService("nobody")).toBeNull();
    });
  });

  describe("account settings", () => {
    test("changes the username and display name", async () => {
      await setUp("friend@example.com", "friend");
      expect(
        await updateProfileService(1, {
          username: "Friendly",
          displayName: "A Friend",
        }),
      ).toEqual({ ok: true, signedItemIds: [] });
      expect(
        await rows(sql`select username, display_name from bluebook.users`),
      ).toEqual([{ username: "Friendly", display_name: "A Friend" }]);
      expect(await signInService("friendly", PASSWORD)).toMatchObject({
        ok: true,
      });
    });

    test("a new display name lists the items the user signed", async () => {
      await setUp("friend@example.com", "friend");
      await setUp("other@example.com", "other");
      await db.execute(sql`truncate bluebook.items restart identity cascade`);
      await db.execute(sql`
        insert into bluebook.items (url, normalized_url, title) values
          ('https://example.com/a', 'https://example.com/a', 'A'),
          ('https://example.com/b', 'https://example.com/b', 'B'),
          ('https://example.com/c', 'https://example.com/c', 'C')`);
      await db.execute(sql`
        insert into bluebook.entries (item_id, user_id, consumed_on) values
          (1, 1, '2026-01-01'), (1, 1, '2026-02-01'), (2, 2, '2026-01-01'),
          (3, 1, '2026-01-01')`);

      const renamed = await updateProfileService(1, {
        username: "friend",
        displayName: "Friend",
      });
      expect(renamed.ok && renamed.signedItemIds.sort()).toEqual([1, 3]);
      expect(
        await updateProfileService(1, {
          username: "friend2",
          displayName: "Friend",
        }),
      ).toEqual({ ok: true, signedItemIds: [] });
    });

    test("a username someone else has is refused, in any case", async () => {
      await setUp("friend@example.com", "friend");
      await setUp("other@example.com", "other");
      expect(
        await updateProfileService(2, {
          username: "FRIEND",
          displayName: "Other",
        }),
      ).toEqual({ ok: false, error: "That username is taken." });
      expect(
        await updateProfileService(2, {
          username: "OTHER",
          displayName: "Other",
        }),
      ).toMatchObject({ ok: true });
      expect(
        await rows(sql`select username from bluebook.users order by id`),
      ).toEqual([{ username: "friend" }, { username: "OTHER" }]);
    });

    test("a username is available unless someone else has it, in any case", async () => {
      await setUp("friend@example.com", "friend");
      await setUp("other@example.com", "other");
      expect(await usernameAvailableService(2, "FRIEND")).toEqual({
        available: false,
        error: "That username is taken.",
      });
      expect(await usernameAvailableService(2, "Other")).toEqual({
        available: true,
      });
      expect(await usernameAvailableService(2, "someone")).toEqual({
        available: true,
      });
    });

    test("the password changes only with the current one", async () => {
      const here = await setUp("friend@example.com", "friend");
      expect(
        await changePasswordService(
          1,
          { currentPassword: "not it", password: "a new password!" },
          here.token,
        ),
      ).toEqual({ ok: false, error: "That's not your current password." });
      expect(await signInService("friend", PASSWORD)).toMatchObject({
        ok: true,
      });
      expect(await signInService("friend", "a new password!")).toEqual({
        ok: false,
      });
    });

    test("a new password signs out every other device", async () => {
      const here = await setUp("friend@example.com", "friend");
      const elsewhere = await createSessionService(1);
      const other = await setUp("other@example.com", "other");

      expect(
        await changePasswordService(
          1,
          { currentPassword: PASSWORD, password: "a new password!" },
          here.token,
        ),
      ).toEqual({ ok: true });
      expect(await findSessionUserService(here.token)).not.toBeNull();
      expect(await findSessionUserService(elsewhere.token)).toBeNull();
      expect(await findSessionUserService(other.token)).not.toBeNull();
      expect(await signInService("friend", PASSWORD)).toEqual({ ok: false });
      expect(await signInService("friend", "a new password!")).toMatchObject({
        ok: true,
      });
    });
  });
});
