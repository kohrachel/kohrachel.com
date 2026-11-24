// Prints a one-time bluebook setup link for an email, adding the user if
// they're new. Run it again for a password reset.
//   bun run bluebook:invite friend@example.com [--base-url https://…]
// --base-url defaults to https://bluebook.kohrachel.com; locally it's
// http://localhost:3000/bluebook. See docs/bluebook/README.md.
import { SETUP_LINK_HOURS } from "@/domain-types/bluebook/auth";
import { inviteService } from "@/services/bluebook/auth/invite";

const args = process.argv.slice(2);
const baseFlag = args.indexOf("--base-url");
const baseUrl = (
  baseFlag === -1 ? "https://bluebook.kohrachel.com" : args[baseFlag + 1]
)?.replace(/\/$/, "");
const email = args.find(
  (arg, index) => !arg.startsWith("--") && index !== baseFlag + 1,
);

if (!email || !baseUrl || !process.env.DATABASE_URL) {
  console.error(
    "Usage: bun run bluebook:invite <email> [--base-url <url>]\nNeeds DATABASE_URL in .env.",
  );
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
