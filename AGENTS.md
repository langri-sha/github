# Agents orientation — `langri-sha/github`

Reusable GitHub Actions workflows and composite actions that the `langri-sha`
repositories call, plus the fleet's `CONTRIBUTING.md` and documentation
standard. Nothing here is published to npm, so there is no Beachball and no
change files.

## Layout

- `.github/workflows/check.yml`, `packages.yml` and `debug.yml` are reusable
  workflows (`on: workflow_call`) for other repositories. `packages.yml`
  releases with Beachball, or with Changesets when the repository has
  `.changeset/config.json`.
- `.github/workflows/workspace.yml` is this repository's CI. It calls the local
  `./.github/workflows/check.yml`, so a change to `check.yml` runs on its own
  pull request.
- `.github/workflows/actions.yml` tests the actions named in its `paths` filter,
  and runs only when their files change. The other actions have no tests.
- `actions/<name>/action.yml` are composite actions.

## Who owns which file

Projen writes `package.json` and every file listed in `.projen/files.json`; they
are read-only. Change them in `.projenrc.ts`, then run `pnpm exec projen`.
Everything else — the workflows, the actions, `README.md`, `CONTRIBUTING.md`,
`docs/` and this file — is edited by hand. Repository settings, branch
protection and the Actions secrets are managed by Terraform outside this
repository; don't change them in the GitHub UI.

## Common tasks

```sh
pnpm install
pnpm exec projen               # re-synthesize from .projenrc.ts
pnpm prettier --check .
pnpm tsc --build .             # type check
dagger check                   # the checks, as CI runs them
```

CI runs the same checks with `dagger check` and the modules in `dagger.toml`,
and also checks that the package manifests are sorted and fixed. It fails when
synthesized files drift from `.projenrc.ts`, and on Renovate pull requests it
re-synthesizes and commits the result.

## Workflows use released actions

The workflows call this repository's actions by tag, e.g.
`langri-sha/github/actions/pnpm@vX.Y.Z`, not by local path. A change to an
action reaches the workflows only after a release is cut and Renovate bumps
those pins here.

## Release

One repository-wide semver tag, `vX.Y.Z`, on `main` covers every workflow and
action. Consumers pin it, e.g. `check.yml@vX.Y.Z`, and Renovate keeps the pins
current. No workflow cuts a release: tag `main` and publish a GitHub release
with generated notes, `gh release create vX.Y.Z --generate-notes`.
