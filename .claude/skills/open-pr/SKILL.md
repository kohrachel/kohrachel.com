---
name: open-pr
description: Open a GitHub pull request for the current branch using this repo's required PR body format (human-written Why/What, agent notes collapsed in a details block). Use whenever opening, creating, or drafting a PR in this repo.
---

# Open a PR

Every PR opened by an agent in this repo must use the body format below. The
**Why** and **What** sections are reserved for the human author — leave the
TODO comments in place and never fill them in. Everything the agent wants to
say goes inside the collapsed `<details>` block.

## Steps

1. Check state: `git status`, `git log main..HEAD --oneline`, and
   `git diff main...HEAD` to understand what the branch contains.
   - If on `main`, create a branch first.
   - If there are uncommitted changes that belong in the PR, commit them
     (only if the user asked you to commit).
2. Push the branch: `git push -u origin HEAD`.
3. Write a short, imperative PR title (under ~70 chars).
4. Build the body using the template below, then open the PR with
   `gh pr create --title "<title>" --body "$(cat <<'EOF' ... EOF)"`.
5. Return the PR URL to the user and remind them to fill in **Why** and
   **What**.

## Body template

Use this exactly (it matches `.github/pull_request_template.md`). Keep the two TODO comments verbatim.

```markdown
## Why

<!-- TODO for human: why do we care about this PR? -->

## What

<!-- TODO for human: what does this PR do, in broad terms? -->

<details>
<summary>🤖 AI:</summary>

<!-- All agent-written text goes here: summary of changes, files touched,
     implementation notes, test plan, caveats, follow-ups, etc. -->

</details>
```

## Rules

- Do **not** write anything in the Why or What sections. Those are for the
  human.
- **All** agent-generated text (change summary, rationale guesses, test plan,
  screenshots notes, risks, attribution line) goes inside `<details>`.
- Leave a blank line after `<summary>…</summary>` and before `</details>` so
  GitHub renders the markdown inside correctly.
- Put any attribution line (e.g. "🤖 Generated with Claude Code") as the last
  line inside the `<details>` block.
