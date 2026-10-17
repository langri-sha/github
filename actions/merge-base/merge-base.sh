#!/usr/bin/env bash
set -euo pipefail

error() {
  if [[ -n ${GITHUB_ACTIONS:-} ]]; then
    echo "::error::$*"
  else
    echo "error: $*" >&2
  fi
}

branch=${1:-$(git ls-remote --symref origin HEAD | sed -n 's|^ref: refs/heads/\(.*\)\tHEAD$|\1|p')}
if [[ -z $branch ]]; then
  error 'No base branch to find the merge base with, and origin names no default branch.'
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
  # A local HEAD may be missing from origin.
  git fetch --no-tags origin "+refs/heads/${branch}:refs/remotes/origin/${branch}"
  sha=$(git merge-base "$base" "$head")
else
  for depth in 50 200 1000 5000 25000; do
    git fetch --no-tags --filter=tree:0 --depth="$depth" origin "${refspecs[@]}"
    sha=$(git merge-base "$base" "$head") && break
  done

  if [[ -z ${sha:-} ]]; then
    error "No merge base of ${head} and ${branch} within ${depth} commits."
    exit 1
  fi

  git fetch --no-tags --filter=blob:none --depth=1 origin "$sha" "$head"
fi

cd "$(git rev-parse --show-toplevel)"
out=.merge-base

# The change is its head's tree with the uncommitted changes on top, put
# together in scratch indexes so the checkout's own index stays as it is.
indexes=$(mktemp -d)
trap 'rm -rf "$indexes"' EXIT
cp "$(git rev-parse --git-path index)" "$indexes/worktree"
GIT_INDEX_FILE=$indexes/worktree git add --all -- . ":(exclude,top)${out}"
GIT_INDEX_FILE=$indexes/change git read-tree "$head"
{
  GIT_INDEX_FILE=$indexes/worktree git diff --cached --name-only --no-renames --diff-filter=D -z HEAD |
    while IFS= read -r -d '' path; do
      printf '0 %040d\t%s\0' 0 "$path"
    done
  GIT_INDEX_FILE=$indexes/worktree git diff --cached --name-only --no-renames --diff-filter=d -z HEAD |
    GIT_INDEX_FILE=$indexes/worktree GIT_LITERAL_PATHSPECS=1 xargs -0 -r git ls-files --stage -z --
} | GIT_INDEX_FILE=$indexes/change git update-index -z --index-info

changes() {
  GIT_INDEX_FILE=$indexes/change git -c core.quotePath=false diff --cached --name-status --no-renames "$@" "$sha"
}

echo "Merge base of ${head} and ${branch}: ${sha}"
changes

mkdir -p "$out"
echo "$sha" > "$out/sha"
echo "$branch" > "$out/ref"
changes -z > "$out/changes"

if [[ -n ${GITHUB_OUTPUT:-} ]]; then
  {
    echo "sha=${sha}"
    echo "head=${head}"
  } >> "$GITHUB_OUTPUT"
fi
