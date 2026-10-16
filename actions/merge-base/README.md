# merge-base

Finds the merge base of a change and its base branch, and the paths the change
touches, without fetching the history:

```yaml
steps:
  - uses: actions/checkout@v7
    with:
      persist-credentials: false

  - uses: langri-sha/github/actions/merge-base@v0
```

The change is a pull request's head on its merge commit, and `HEAD` otherwise.
`base` defaults to the pull request's base branch, or else the default branch.

It writes three files to `.merge-base/` at the repository root, which the
[`beachball`](https://github.com/langri-sha/dagger/tree/main/beachball) Dagger
module reads in place of the history:

| File      | Content                                                                         |
| --------- | ------------------------------------------------------------------------------- |
| `sha`     | The merge base                                                                  |
| `ref`     | The base branch, e.g. `main`                                                    |
| `changes` | `git -c core.quotePath=false diff --name-status --no-renames -z <sha> <change>` |

It also outputs the merge base as `sha` and the change's commit as `head`.

The checkout stays shallow. The action fetches commits without their trees,
deepening 50, 200, 1,000, 5,000 and 25,000 commits back until the merge base
turns up, and fails past that. Then it fetches the two trees it compares,
without blobs. On a typical pull request that is 10–25 KiB in about a second,
where `fetch-depth: 0` downloads the whole history.

The fetches authenticate with `token`, which defaults to the job's token, for
those commands only, so the action works with `persist-credentials: false`.
