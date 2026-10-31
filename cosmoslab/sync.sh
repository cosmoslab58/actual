#!/usr/bin/env bash
# Keep the cosmoslab branch = latest Actual release + our patches. Runs on bodhi (timer).
# New release: rebase our commits onto it and push (GitHub Actions then builds the image).
# Patches no longer apply: abort, alert, and leave the branch (and the running image) as is.
set -euo pipefail
cd "$(dirname "$0")/.."
alert() { /usr/local/bin/notify -p "$1" actual-fork "$2" || echo "$2" >&2; }

git fetch -q --tags upstream
latest=$(gh api repos/actualbudget/actual/releases/latest --jq .tag_name)
base=$(git describe --tags --abbrev=0 --match 'v[0-9]*' cosmoslab)
if [[ "$latest" == "$base" ]]; then echo "cosmoslab already on $latest"; exit 0; fi

git checkout -q cosmoslab
if ! git rebase -q --onto "$latest" "$base" cosmoslab; then
  git rebase --abort || true
  alert 5 "Our patches no longer apply on Actual $latest; still running $base. Fix in ~/projects/actual-cosmoslab."
  exit 1
fi
git push -q --force-with-lease origin cosmoslab
alert 2 "Rebased our Actual patches onto $latest; GitHub is building the image (bodhi picks it up at 03:00)."
