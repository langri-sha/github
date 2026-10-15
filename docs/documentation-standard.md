# Documentation standard

How `langri-sha` repositories document themselves. `README.md` is for people:
what the repository does, how to use it, how to contribute. `AGENTS.md` is for
coding agents: where things are, which files are generated, the commands, and
the rules a newcomer would break. Both are short, and neither carries history.

## Where each fact goes

| Fact                                                                  | Home                                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| What it is, install, a usage example                                  | `README.md`                                                         |
| Commit style, pull requests, change files, CI setup                   | [`CONTRIBUTING.md`](../CONTRIBUTING.md), linked from each README    |
| Layout, generated files, commands, release trigger, tag scheme, traps | `AGENTS.md`                                                         |
| A push or review flow that differs from the usual pull request        | `AGENTS.md`, under Repository policy                                |
| Release history                                                       | `CHANGELOG.md`, written by Beachball or by hand where there is none |
| Plans, research and decision logs                                     | Outside the repository                                              |

## Rules for both files

- No history: no "ported from", former package names, dated status, phase
  labels, or "currently", "yet" and "for now". Git and the changelog keep it.
- Keep the owner's voice. A personal opener, a joke, an emoji or a first-person
  line stays verbatim, typos included, with the factual description after it. If
  a line could be voice or narration, keep it.
- Don't hard-code what drifts, like Node, pnpm or Terraform versions, or cloud
  IDs. Name the file that pins it.
- Keep each file's name and casing, `readme.md` or `README.md`. Renaming breaks
  links and buys nothing.
- Use relative paths, never absolute host paths.

## README

Start from [`README-template.md`](README-template.md): a title, one paragraph on
what it does, Usage, and Contributing. Private repositories may leave out
Contributing. A stub or an unmaintained repository says so in one line under the
title.

Add a badge only when it resolves to a live workflow (`workspace.yml`) or a
published package. Leave out a Features list that repeats the intro, layout
tables that belong in `AGENTS.md`, and embedded changelogs.

Good shapes to copy: `monorepo-resolve/readme.md` for a library,
`langri-sha.com/readme.md` for a monorepo (Development and Releasing).

## AGENTS.md

```md
# Agents orientation — `langri-sha/<repo>`

What it is, in one to three sentences.

## Who owns which file

## Common tasks

## <Repository-specific constraints>

## Release

## Repository policy
```

Leave out the sections that don't apply. Repository policy appears only when the
repository overrides the usual flow, for example "commit on `main` and push each
commit". Constraint sections hold the rules a newcomer would break, such as
`vitest/AGENTS.md` on Vitest being both a peer and a devDependency.

Where the repository root is a Beachball package, add `AGENTS.md` to
`ignorePatterns` and `npmIgnore` in `.projenrc.ts`, as `prettier` does.
Otherwise it demands a change file and ships in the tarball.

### Who owns which file

In projen repositories, point at `.projen/files.json` rather than listing the
generated files, which drift:

> Projen writes `package.json` and every file listed in `.projen/files.json`;
> they are read-only. Change them in `.projenrc.ts`, then run
> `pnpm exec projen`. Beachball owns `CHANGELOG.md`, `CHANGELOG.json` and the
> `version` field. Everything else is edited by hand.

### Common tasks

One block, one command per line, tests before the type check:

```sh
pnpm install
pnpm exec projen               # re-synthesize from .projenrc.ts
pnpm vitest                    # tests
pnpm tsc --build .             # type check
pnpm eslint . && pnpm prettier --check .
pnpm change                    # write a change file
```

Dagger repositories use `dagger check` and `dagger generate` instead, as
`langri-sha.com/readme.md` does.

### Release

Say what triggers a release and how versions are tagged.

- npm packages released with Beachball: anything that reaches the tarball or
  builds it needs a change file; use `none` for readme-only edits. Nothing
  publishes on merge: the Release workflow (`publish.yml`) runs by hand, tags
  each version `v<version>` and creates a GitHub release. Name any exceptions,
  such as `projen` creating no tags or releases.
- Tagged repositories, like this one: one `vX.Y.Z` tag on `main` covers the
  repository, consumers pin it, and each tag gets a GitHub release with
  generated notes (`gh release create vX.Y.Z --generate-notes`).
- Anything else, such as a site deployed by publishing a release or a provider
  released through GoReleaser: state the trigger in one sentence, or link the
  `CONTRIBUTING.md` that has the steps, such as
  `terraform-provider-aperture/CONTRIBUTING.md`.

### CI

One line on what `workspace.yml` runs. It fails when synthesized files drift
from `.projenrc.ts` or a package lacks a change file. On Renovate pull requests
it re-synthesizes, writes change files and commits the result.

## What stays out

- Provenance, migration stories and former package names.
- Roadmaps, status reports and milestones.
- Commit and pull request conventions, which `CONTRIBUTING.md` covers.
- Per-repository Renovate notes, except for traps that a rule in the repository
  enforces. `renovate-config/readme.md` covers the shared preset.
