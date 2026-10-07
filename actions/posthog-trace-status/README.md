# posthog-trace-status

Links a commit to its CI trace in PostHog with a commit status.

Give `check.yml` a `posthog-project-id` along with its `posthog-project-token`,
then publish its `posthog-trace-url` output from a job that may write statuses:

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

The status is informational: always `success`, and only a warning when it can't
be published, e.g. on pull requests from forks. Leave it out of required checks.
It runs in a job of the caller's because a reusable workflow can't ask for
`statuses: write` without breaking every caller that doesn't grant it.

PostHog project tokens are public, write-only keys, which is why
`posthog-project-token` is an input rather than a secret.
