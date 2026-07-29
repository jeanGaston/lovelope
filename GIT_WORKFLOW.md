# Git workflow

This project uses a lightweight trunk-based workflow. It's a solo/small-team
project, so the goal is just enough process to keep `main` deployable and the
history readable — not ceremony for its own sake.

## Branches

- `main` — always deployable. Nothing is committed to `main` directly except
  by merging a branch through the steps below.
- `feat/<short-name>` — new functionality (e.g. `feat/gif-picker`).
- `fix/<short-name>` — bug fixes (e.g. `fix/expired-proposal-redirect`).
- `refactor/<short-name>` — internal changes with no user-facing behavior
  change (e.g. `refactor/ui-ux-shadcn`).
- `chore/<short-name>` — tooling, deps, config.

Branch names are kebab-case and describe the change, not the ticket number
(there's no issue tracker yet).

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <summary, imperative mood, no trailing period>

<optional body: why, not what>
```

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`.

- Keep commits small and focused — one logical change per commit.
- Write the summary in the imperative ("add", not "added"/"adds").
- Explain *why* in the body when the reason isn't obvious from the diff.

## Merging

- Rebase your branch on `main` before merging (`git fetch && git rebase
  origin/main`) to keep history linear — don't merge `main` into a feature
  branch.
- Squash-merge feature/fix/chore branches into `main` so each lands as one
  commit. Larger `refactor/*` branches with independently meaningful commits
  may use a regular merge instead of squashing, if keeping the granular
  history is genuinely useful for a future bisect.
- Delete the branch after it's merged.
- Never force-push `main`. Force-pushing a feature branch you own (after a
  rebase) is fine; never force-push a branch someone else might be using.

## Tags / releases

Tag production releases as `v<major>.<minor>.<patch>` (semver) once this
project has a deployment cadence worth marking. Not required for every merge.

## What not to commit

- Anything in `.gitignore` (`.env`, `/data`, `.next`, `node_modules`, prisma
  migration SQL under `prisma/migrations/*/migration.sql`).
- Generated/build artifacts.
- Secrets of any kind, even in comments or examples — use `.env.example` for
  documenting required variables.
