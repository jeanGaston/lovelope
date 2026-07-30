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

## Releases & Docker images

CI (`.gitea/workflows/docker-publish.yml`) never builds an image from a
plain commit or merge to `main`/`master` — only from two deliberate
triggers, each producing tags on both the Gitea registry and GHCR:

| Trigger         | Produces                | Purpose                            |
|------------------|--------------------------|-------------------------------------|
| push to `dev`    | `:dev`                   | test a build before releasing       |
| push a `v*` tag  | `:latest` + `:vX.Y.Z`    | ship an actual release               |

### Testing a build (`dev`)

`dev` is a disposable pointer, not a branch with history of its own — it
should always match `main`/`master` exactly. Bring it up to date and push
whenever you want a fresh test image:

```
git checkout dev
git merge main --ff-only
git push origin dev
```

If `dev` has drifted and won't fast-forward (e.g. after a rebase, or a
commit landed only on `dev` by mistake), reset it instead of merging —
`dev` has no unique history worth preserving:

```
git checkout dev
git reset --hard main
git push origin dev --force-with-lease
```

### Shipping a release (tag)

1. Bump the version in `package.json` on `main`/`master` (a plain commit —
   builds nothing on its own):
   ```
   # edit package.json: "version": "X.Y.Z"
   git add package.json
   git commit -m "chore: bump version to X.Y.Z"
   git push origin main
   ```
2. Tag that commit and push the tag — this is what actually triggers the
   release build:
   ```
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
3. Never move or re-push an existing tag once it's out (it may already be
   pulled/deployed). If you need to fix something after tagging, bump to
   the next patch version and tag again instead.

Use `v<major>.<minor>.<patch>` (semver) for tags.

### Required repo secrets/variables (Gitea → Settings → Actions)

- `vars.REGISTRY_HOST` — the Gitea instance hostname (no protocol), used to
  tag/push to the built-in Gitea container registry.
- `secrets.REGISTRY_TOKEN` — a Gitea PAT with `write:package` scope.
- `secrets.GHCR_TOKEN` — a GitHub PAT with `write:packages` scope, used to
  also push to `ghcr.io`.

## What not to commit

- Anything in `.gitignore` (`.env`, `/data`, `.next`, `node_modules`, prisma
  migration SQL under `prisma/migrations/*/migration.sql`).
- Generated/build artifacts.
- Secrets of any kind, even in comments or examples — use `.env.example` for
  documenting required variables.
