# Contributing

Thank you for contributing to Langri-Sha open source projects.

## Commit Conventions

Write each commit subject as a plain imperative sentence of around 50
characters, without a type prefix or a trailing period: "Add the release
workflow", not `feat: add release workflow`. Add a body only when the reason for
the change isn't clear from the diff, and put issue references there
(`Closes #123`).

Keep each commit to one change a reviewer can accept on its own.

## Changelog Policy

Changelogs are maintained by
[Beachball](https://microsoft.github.io/beachball/).

1. Every PR that changes user-facing behaviour must include a change file:

   ```sh
   pnpm beachball change
   ```

   Choose the bump type (`patch`, `minor`, `major`) and write a one-line human
   description. The change file is committed alongside your code.

2. On merge to `main`, the `packages.yml` CI workflow collects change files,
   bumps versions following semver, writes `CHANGELOG.md`, and publishes to npm
   automatically.

3. **Do not hand-edit `CHANGELOG.md` or `package.json` versions.** Let Beachball
   manage them.

## Release Process

| Step                | Who               | How                                |
| ------------------- | ----------------- | ---------------------------------- |
| Open PR             | Author            | Regular branch → PR                |
| Pass CI             | CI                | `check.yml` must be green          |
| Include change file | Author            | `pnpm beachball change`            |
| Merge               | Author / reviewer | Rebase merge                       |
| Publish             | CI                | `packages.yml` runs on `main` push |

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
- `permissions: contents: write` is required. The called Renovate post-upgrade
  job needs it, and a called job can't exceed its caller's permissions, so
  without it the run fails at startup.
- Enable only the checks a repository uses. Set `dagger: true` to run
  `dagger check` in place of the lint and Vitest jobs.

Nothing merges with a red CI.
