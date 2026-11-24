// Prints a one-time bluebook setup link for an email, adding the user if
// they're new. Run it again for a password reset.
//   bun run bluebook:invite friend@example.com [--base-url https://…]
import { parseArgs } from "node:util";
import { SETUP_LINK_HOURS } from "@/domain-types/bluebook/auth";
import { inviteService } from "@/services/bluebook/auth/invite";

const USAGE = "Usage: bun run bluebook:invite <email> [--base-url <url>]";

function readArgs() {
  try {
    return parseArgs({
      options: {
        "base-url": {
          type: "string",
          default: "https://bluebook.kohrachel.com",
        },
      },
      allowPositionals: true,
    });
  } catch (error) {
    console.error(`${(error as Error).message}\n${USAGE}`);
    process.exit(1);
  }
}

const { values, positionals } = readArgs();
const email = positionals[0];
const baseUrl = values["base-url"].replace(/\/$/, "");

if (!email || positionals.length > 1 || !baseUrl) {
  console.error(USAGE);
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL isn't set. Add it to .env.");
  process.exit(1);
}

try {
  const result = await inviteService(email);
  console.log(
    result.created
      ? `Added ${email}.`
      : result.needsProfile
        ? `${email} was already invited; their old link no longer works.`
        : `${email} already has an account; this link resets their password.`,
  );
  if (result.disabled) {
    console.log(
      "They're disabled, so the link won't work until you clear disabled_at.",
    );
  }
  console.log(
    `\n${baseUrl}/setup/${result.token}\n\nExpires in ${SETUP_LINK_HOURS} hours.`,
  );
  process.exit(0);
} catch (error) {
  console.error("Couldn't make the link:", error);
  process.exit(1);
}
