# Contributing

## Commit Conventions

Write each commit subject as a plain imperative sentence of around 50
characters, without a type prefix or a trailing period: "Add the release
workflow", not `feat: add release workflow`. Add a body only when the reason for
the change isn't clear from the diff, and put issue references there
(`Closes #123`).

Keep each commit to one change a reviewer can accept on its own.

## Changelog Policy

Changelogs are maintained by
[Changesets](https://github.com/changesets/changesets).

1. Every PR that touches a package's files must include a change file, or the
   Dagger changesets check fails.

   ```sh
   pnpm exec changeset
   ```

   Choose the bump type (`patch`, `minor`, `major`) and write a one-line human
   description. Use `pnpm exec changeset --empty` for changes that shouldn't cut
   a release on their own, such as README-only edits. The change file is
   committed alongside your code.

2. Nothing releases on merge. A maintainer dispatches `workspace-release.yml`
   from the Actions tab. It calls `packages.yml`, which collects the change
   files, bumps versions, writes `CHANGELOG.md`, commits to the default branch,
   tags and creates the GitHub release.

3. **Do not hand-edit `CHANGELOG.md` or `package.json` versions, and never tag
   by hand.** Let Changesets manage them.

## Release Process

| Step                | Who               | How                              |
| ------------------- | ----------------- | -------------------------------- |
| Open PR             | Author            | Regular branch → PR              |
| Pass CI             | CI                | `check.yml` must be green        |
| Include change file | Author            | `pnpm exec changeset`            |
| Merge               | Author / reviewer | Rebase merge                     |
| Release             | Maintainer        | Dispatch `workspace-release.yml` |

## CI

Repositories run the reusable
[`check.yml`](https://github.com/langri-sha/github/blob/main/.github/workflows/check.yml)
from [`langri-sha/github`](https://github.com/langri-sha/github) through a
`.github/workflows/workspace.yml` workflow named "Workspace". It is written by
hand; projen does not generate it.

```yaml
# .github/workflows/workspace.yml
name: Workspace

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  check:
    permissions:
      contents: write
    uses: langri-sha/github/.github/workflows/check.yml@v0.24.0
    with:
      beachball: true
      eslint: true
      prettier: true
      projen: true
      typescript: true
    secrets: inherit
```

- Pin `check.yml` to a released version; Renovate keeps the pin current.
- Set `permissions: contents: write`. The called Renovate post-upgrade job needs
  it, and a called job can't exceed its caller's permissions, so where the
  repository's default workflow token is read-only the run fails at startup
  without it.
- Enable only the checks a repository uses. Set `dagger: true` to run
  `dagger check` in place of the lint and Vitest jobs.

Nothing merges with a red CI.

## Documentation

READMEs and `AGENTS.md` files follow the
[documentation standard](docs/documentation-standard.md).
