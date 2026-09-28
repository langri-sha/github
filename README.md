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

| Input                   | Type      | Default                    | Description                             |
| ----------------------- | --------- | -------------------------- | --------------------------------------- |
| `eslint`                | `boolean` | `false`                    | Run ESLint                              |
| `prettier`              | `boolean` | `false`                    | Run Prettier                            |
| `typescript`            | `boolean` | `false`                    | Run TypeScript type-check               |
| `vitest`                | `boolean` | `false`                    | Run Vitest tests                        |
| `beachball`             | `boolean` | `false`                    | Run Beachball change-file check         |
| `packages`              | `boolean` | `false`                    | Validate package.json files             |
| `projen`                | `boolean` | `false`                    | Run projen synthesis check              |
| `dagger`                | `boolean` | `false`                    | Run Dagger checks                       |
| `posthog-host`          | `string`  | `https://eu.i.posthog.com` | PostHog host for Dagger traces          |
| `posthog-project-token` | `string`  | `''`                       | PostHog project token for Dagger traces |
| `posthog-project-id`    | `string`  | `''`                       | PostHog project ID for trace links      |
| `posthog-app-host`      | `string`  | `https://eu.posthog.com`   | PostHog app host for trace links        |

With `dagger` set, `dagger check` runs the repository's Dagger workspace in
place of the Lint and Vitest jobs, at the engine version
[`actions/dagger-version`](actions/dagger-version/) resolves from its module
manifests, and the other inputs only pick the fixes the Renovate post-upgrade
job applies.

Set `posthog-project-token` to a PostHog project token to export the Dagger
traces to PostHog's OTLP ingestion at `posthog-host`, tagged with the
repository, ref, commit, and run. Project tokens are public, write-only keys, so
it is an input rather than a secret.

Also set `posthog-project-id` to link the trace: the Dagger job starts the trace
under a known ID, adds the link to its job summary, and exposes it as the
`posthog-trace-url` output. To show the link on commits and pull requests,
publish it as a commit status from a job that may write statuses:

```yaml
jobs:
  check:
    uses: langri-sha/github/.github/workflows/check.yml@v0
    with:
      dagger: true
      posthog-project-token: phc_...
      posthog-project-id: '12345'

  trace:
    needs: check
    if: always() && needs.check.outputs.posthog-trace-url
    runs-on: ubuntu-latest
    permissions:
      statuses: write
    steps:
      - uses: langri-sha/github/actions/posthog-trace-status@v0
        with:
          url: ${{ needs.check.outputs.posthog-trace-url }}
```

The `posthog-trace/dagger` status is informational: it is always `success`,
skipped without a trace, and only warns when it cannot be published, e.g. on
pull requests from forks. Leave it out of required status checks. It runs in the
caller's job because a reusable workflow cannot ask for `statuses: write`
without breaking every caller that does not grant it.

### `packages.yml`

Publishes packages to npm via
[Beachball](https://microsoft.github.io/beachball/). Called after merging to
main:

```yaml
jobs:
  publish:
    uses: langri-sha/github/.github/workflows/packages.yml@v0
    with:
      scope: '@langri-sha'
    secrets:
      APP_CLIENT_ID: ${{ secrets.APP_CLIENT_ID }}
      APP_PRIVATE_KEY: ${{ secrets.APP_PRIVATE_KEY }}
```

`APP_CLIENT_ID` and `APP_PRIVATE_KEY` belong to a GitHub App installation whose
token is used for the release Git operations; `secrets: inherit` works too. npm
publishing uses OIDC trusted publishing, so no npm token is needed.

## Actions

| Action                                                                      | Description                              |
| --------------------------------------------------------------------------- | ---------------------------------------- |
| [`actions/pnpm`](actions/pnpm/)                                             | Set up pnpm with caching                 |
| [`actions/github-action-bot-git-user`](actions/github-action-bot-git-user/) | Configure git user as GitHub Actions bot |
| [`actions/google-cloud-platform`](actions/google-cloud-platform/)           | Authenticate to Google Cloud             |
| [`actions/terraform`](actions/terraform/)                                   | Set up Terraform                         |
| [`actions/dagger-version`](actions/dagger-version/)                         | Resolve the Dagger engine version        |
| [`actions/posthog-trace-status`](actions/posthog-trace-status/)             | Link a commit to its PostHog trace       |
| [`actions/github-release`](actions/github-release/)                         | Create GitHub releases for tags          |

### `actions/github-release`

Creates a GitHub release with generated notes for each given tag that does not
have one yet, so reruns are safe. The tags must already be pushed, and the token
needs `contents: write`:

```yaml
- uses: langri-sha/github/actions/github-release@v0
  with:
    tags: v1.0.0 v1.0.1
```

## Templates

- [README template](docs/README-template.md) — standard layout for all repos
- [CONTRIBUTING](CONTRIBUTING.md) — commit conventions, changelog, and release
  process

## License

MIT © [Filip Dupanović](https://github.com/langri-sha)
