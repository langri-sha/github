#!/usr/bin/env bash
set -euo pipefail

branch=${1:-}
if [[ -z $branch ]]; then
  echo '::error::No base branch to find the merge base with. Set the base input.'
  exit 1
fi

base="refs/remotes/origin/${branch}"
head=$(git rev-parse HEAD)
refspecs=("$head" "+refs/heads/${branch}:${base}")

if [[ ${GITHUB_REF:-} == refs/pull/*/merge && ${GITHUB_SHA:-} == "$head" ]]; then
  # A shallow checkout grafts away the parents of its tip, so read them from
  # the commit itself.
  mapfile -t parents < <(git cat-file commit HEAD | sed -n 's/^parent //p')
  base=${parents[0]}
  head=${parents[1]}
  refspecs=("$base" "$head")
fi

if [[ $(git rev-parse --is-shallow-repository) == false ]]; then
  git fetch --no-tags origin "${refspecs[@]}"
  sha=$(git merge-base "$base" "$head")
else
  for depth in 50 200 1000 5000 25000; do
    git fetch --no-tags --filter=tree:0 --depth="$depth" origin "${refspecs[@]}"
    sha=$(git merge-base "$base" "$head") && break
  done

  if [[ -z ${sha:-} ]]; then
    echo "::error::No merge base of ${head} and ${branch} within ${depth} commits."
    exit 1
  fi

  git fetch --no-tags --filter=blob:none --depth=1 origin "$sha" "$head"
fi

echo "Merge base of ${head} and ${branch}: ${sha}"
git -c core.quotePath=false diff --name-status --no-renames "$sha" "$head"

out="$(git rev-parse --show-toplevel)/.merge-base"
mkdir -p "$out"
echo "$sha" > "$out/sha"
echo "$branch" > "$out/ref"
git -c core.quotePath=false diff --name-status --no-renames -z "$sha" "$head" > "$out/changes"

{
  echo "sha=${sha}"
  echo "head=${head}"
} >> "$GITHUB_OUTPUT"
