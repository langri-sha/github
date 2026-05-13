# Contributing

Thank you for contributing to Langri-Sha open source projects.

## Commit Conventions

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change without feature/fix |
| `test` | Tests only |
| `chore` | Tooling, deps, CI |
| `perf` | Performance improvement |

**Breaking changes:** add `!` after the type (e.g. `feat!: drop Node 18 support`) and describe the break in the footer with `BREAKING CHANGE:`.

## Changelog Policy

Changelogs are maintained by [Beachball](https://microsoft.github.io/beachball/).

1. Every PR that changes user-facing behaviour must include a change file:

   ```sh
   pnpm beachball change
   ```

   Choose the bump type (`patch`, `minor`, `major`) and write a one-line human description. The change file is committed alongside your code.

2. On merge to `main`, the `packages.yml` CI workflow collects change files, bumps versions following semver, writes `CHANGELOG.md`, and publishes to npm automatically.

3. **Do not hand-edit `CHANGELOG.md` or `package.json` versions.** Let Beachball manage them.

## Release Process

| Step | Who | How |
|------|-----|-----|
| Open PR | Author | Regular branch → PR |
| Pass CI | CI | `check.yml` must be green |
| Include change file | Author | `pnpm beachball change` |
| Merge | Author / reviewer | Squash or merge commit |
| Publish | CI | `packages.yml` runs on `main` push |

## Docs Platform

Project documentation is written in Markdown and hosted on GitHub Pages.

- Package-level docs live in the repo README and inline JSDoc.
- Dedicated docs sites (when needed) use [VitePress](https://vitepress.dev/). See `docs/` in the relevant package for source.
- The personal site at [langri-sha.com](https://langri-sha.com) hosts guides and demos.

## CI

All repos call the reusable workflow from [`langri-sha/github`](https://github.com/langri-sha/github):

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    uses: langri-sha/github/.github/workflows/check.yml@v0
    with:
      eslint: true
      prettier: true
      typescript: true
      vitest: true
      beachball: true
```

Nothing merges with a red CI.
