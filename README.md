# github

Reusable workflows and composite actions for GitHub Actions.

[![CI](https://github.com/langri-sha/github/actions/workflows/check.yml/badge.svg)](https://github.com/langri-sha/github/actions/workflows/check.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Workflows

### `check.yml`

Reusable lint, type-check, and test workflow. Call it from any repo:

```yaml
jobs:
  check:
    uses: langri-sha/github/.github/workflows/check.yml@v0
    with:
      eslint: true
      prettier: true
      typescript: true
      vitest: true
```

Supported inputs:

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `eslint` | `boolean` | `false` | Run ESLint |
| `prettier` | `boolean` | `false` | Run Prettier |
| `typescript` | `boolean` | `false` | Run TypeScript type-check |
| `vitest` | `boolean` | `false` | Run Vitest tests |
| `beachball` | `boolean` | `false` | Run Beachball change-file check |
| `packages` | `boolean` | `false` | Validate package.json files |
| `projen` | `boolean` | `false` | Run projen synthesis check |

### `packages.yml`

Publishes packages to npm via [Beachball](https://microsoft.github.io/beachball/). Called after merging to main:

```yaml
jobs:
  publish:
    uses: langri-sha/github/.github/workflows/packages.yml@v0
    with:
      scope: "@langri-sha"
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
      REPO_TOKEN: ${{ secrets.REPO_TOKEN }}
```

## Actions

| Action | Description |
|--------|-------------|
| [`actions/pnpm`](actions/pnpm/) | Set up pnpm with caching |
| [`actions/github-action-bot-git-user`](actions/github-action-bot-git-user/) | Configure git user as GitHub Actions bot |
| [`actions/google-cloud-platform`](actions/google-cloud-platform/) | Authenticate to Google Cloud |
| [`actions/terraform`](actions/terraform/) | Set up Terraform |

## Templates

- [README template](docs/README-template.md) — standard layout for all repos
- [CONTRIBUTING](CONTRIBUTING.md) — commit conventions, changelog, and release process

## License

MIT © [Filip Dupanović](https://github.com/langri-sha)
