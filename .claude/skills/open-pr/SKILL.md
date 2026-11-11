---
name: open-pr
description: Open a GitHub pull request for the current branch using this repo's required PR body format (human-written Why/What, agent notes collapsed in a details block). Use whenever opening, creating, or drafting a PR in this repo.
---

# Open a PR

Every PR opened by an agent in this repo must use the body format in `.github/pull_request_template.md`. The
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
3. Write the PR title in Conventional Commits format: `type(domain): title`
   (under ~70 chars), e.g. `feat(editor): list, create and edit posts` or
   `fix(editor): stop template stylesheet from styling the whole page`.
   - `type` is one of `feat`, `fix`, `refactor`, `style`, `perf`, `docs`,
     `test`, `build`, `ci`, or `chore`.
   - `domain` is the area of the codebase the change touches (e.g. `editor`,
     `post`, `posts`).
   - `title` is short, imperative, and lowercase.
4. Build the body from the PR template (see below), then open the PR with
   `gh pr create --title "<title>" --body "$(cat <<'EOF' ... EOF)"`.
   - If the branch builds on another unmerged PR branch, pass that branch as
     `--base <parent-branch>` instead of `main`.
5. **Stacked PRs:** if the base is another PR's branch (not `main`), link the
   PRs into a GitHub stack. Don't leave them as separate PRs.
   - Needs the extension: `gh extension install github/gh-stack` (skip if
     `gh extension list` already shows `github/gh-stack`).
   - New stack: `gh stack link <bottom-pr> <next-pr> ... <top-pr>`, listing PR
     numbers from bottom (closest to `main`) to top.
   - Existing stack: `gh stack link <stack-number> <new-pr>` adds the new PR
     to the top. Find the stack number with `gh stack view` or in the PR's
     stack UI on GitHub.
   - Pass PR numbers, not branch names. With PR numbers, `link` reuses the
     PRs you opened with the template body. With branch names, it would make
     new PRs with generated bodies.
   - Don't use `gh stack submit` to open PRs. It writes its own titles and
     bodies and skips the PR template.
   - Run `gh stack view` to check the order.
6. Return the PR URL(s) to the user and remind them to fill in **Why** and
   **What**. For a stack, also give the stack order.

## Body template

Read `.github/pull_request_template.md` (repo root) and use it as the PR body.
It is the single source of truth for the format — do not hardcode or
paraphrase it. Keep its TODO comments verbatim, and replace only the
placeholder comment inside `<details>` with your own text.

## Rules

- Do **not** write anything in the Why or What sections. Those are for the
  human.
- **All** agent-generated text (change summary, rationale guesses, test plan,
  screenshots notes, risks, attribution line) goes inside `<details>`.
- Leave a blank line after `<summary>…</summary>` and before `</details>` so
  GitHub renders the markdown inside correctly.
- Put any attribution line (e.g. "🤖 Generated with Claude Code") as the last
  line inside the `<details>` block.
