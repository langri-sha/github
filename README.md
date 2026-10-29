# github

Reusable workflows and composite actions for GitHub Actions.

[![CI](https://github.com/langri-sha/github/actions/workflows/check.yml/badge.svg)](https://github.com/langri-sha/github/actions/workflows/check.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Workflows

### `check.yml`

Lints, type-checks and tests a repository. Turn on the checks that apply:

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

| Input                   | Default                    | Description                                      |
| ----------------------- | -------------------------- | ------------------------------------------------ |
| `eslint`                | `false`                    | Run ESLint                                       |
| `prettier`              | `false`                    | Run Prettier                                     |
| `typescript`            | `false`                    | Type-check with TypeScript                       |
| `vitest`                | `false`                    | Run Vitest tests                                 |
| `beachball`             | `false`                    | Check for Beachball change files                 |
| `packages`              | `false`                    | Validate `package.json` files                    |
| `projen`                | `false`                    | Check that projen's output is up to date         |
| `dagger`                | `false`                    | Run the repository's Dagger checks instead       |
| `runs-on`               | `ubuntu-latest`            | Runner label for every job                       |
| `dagger-version`        | `''`                       | Dagger version, if it can't be read from modules |
| `posthog-project-token` | `''`                       | Send Dagger traces to PostHog                    |
| `posthog-project-id`    | `''`                       | Link each run to its trace in PostHog            |
| `posthog-host`          | `https://eu.i.posthog.com` | PostHog host traces are sent to                  |
| `posthog-app-host`      | `https://eu.posthog.com`   | PostHog app host trace links point to            |

With `dagger` on, `dagger check` replaces the lint and test jobs, and the other
check inputs only choose which fixes the Renovate post-upgrade job applies. With
`beachball` on as well, the Dagger job first runs
[`actions/merge-base`](actions/merge-base/), which hands the `beachball` module
the merge base and the changed paths. A workspace that lists the `changesets`
module in `dagger.toml` gets the same, and its post-upgrade job writes an empty
change file for Renovate's pull requests. To show the trace link on commits and
pull requests, see
[`actions/posthog-trace-status`](actions/posthog-trace-status/).

### `packages.yml`

Publishes packages to npm with
[Beachball](https://microsoft.github.io/beachball/) after merging to `main`:

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

npm publishing uses trusted publishing, so no npm token is needed. The GitHub
App pushes the release commit and tags; `secrets: inherit` works too.

Beachball tags each version as `<name>_v<version>`. To name tags yourself, turn
off Beachball's `gitTags` and set `tag-template`, e.g. `v{version}`. Set
`github-releases: true` to also create a GitHub release for each published
version.

A repository with a `.changeset/config.json` is released with
[Changesets](https://github.com/changesets/changesets) instead, which ignores
`github-releases` and `tag-template`. Call the workflow on a push to `main`; it
does nothing on any other ref. While change files are pending, the GitHub App
keeps a `Version Packages` pull request open, so CI runs on it. When that pull
request merges, the workflow runs `changeset tag`, pushes the `vX.Y.Z` tag and
creates a GitHub release with generated notes. A private package needs
`privatePackages: { version: true, tag: true }` in the config, and the App needs
`contents` and `pull requests` write access.

### App credentials

Both workflows mint a GitHub App token: `check.yml` to push Renovate's
post-upgrade changes, `packages.yml` for the release commit or version pull
request and its tags. Pass the App's client ID and private key as the
`APP_CLIENT_ID` and `APP_PRIVATE_KEY` secrets, which `secrets: inherit` covers.

A repository that stores no App credentials can have the workflow read them
instead, keeping nothing secret in GitHub. Grant the calling job
`id-token: write` and set four Actions variables:

| Variable                     | Description                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `APP_CLIENT_ID`              | The App's client ID, which is not a secret                                            |
| `APP_PRIVATE_KEY_SECRET`     | Secret Manager secret holding the private key, as `projects/<project>/secrets/<name>` |
| `GOOGLE_PROJECT`             | Google Cloud project to authenticate against                                          |
| `WORKLOAD_IDENTITY_PROVIDER` | Full resource name of the Workload Identity provider that trusts the job's token      |

The job then authenticates with its own OIDC token through Workload Identity
Federation, reads the private key, mints the token, and deletes the Google
credentials before checking anything out. It takes this path only when the
secrets are absent, and a repository with neither fails on the first step,
naming what is missing.

## Actions

| Action                                                                      | Description                              |
| --------------------------------------------------------------------------- | ---------------------------------------- |
| [`actions/pnpm`](actions/pnpm/)                                             | Set up pnpm with caching                 |
| [`actions/github-action-bot-git-user`](actions/github-action-bot-git-user/) | Configure git user as GitHub Actions bot |
| [`actions/google-cloud-platform`](actions/google-cloud-platform/)           | Authenticate to Google Cloud             |
| [`actions/terraform`](actions/terraform/)                                   | Set up Terraform                         |
| [`actions/dagger-version`](actions/dagger-version/)                         | Resolve the Dagger engine version        |
| [`actions/merge-base`](actions/merge-base/)                                 | Find a merge base and the changed paths  |
| [`actions/posthog-trace-status`](actions/posthog-trace-status/)             | Link a commit to its PostHog trace       |
| [`actions/github-release`](actions/github-release/)                         | Create GitHub releases for tags          |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for commit conventions, changelogs, the
release process and CI setup.

## License

MIT © [Filip Dupanović](https://github.com/langri-sha)
