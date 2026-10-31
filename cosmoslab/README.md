# cosmoslab fork of Actual

Branch `cosmoslab` = the latest Actual release + our patches, nothing else. Never merge upstream
`master` into it; `sync.sh` rebases onto each release tag, so we only ever run what Actual ships.

- **Patches** (keep them few and small; one commit each):
  - `budget/tracking/budgetsummary/MovedOffBudget.tsx`: a "Moved off budget" line under Income and
    Expenses with the month's net transfers into off-budget accounts (not counted in either).
- **sync.sh** (bodhi, daily timer `actual-fork-sync`): new release -> rebase -> push. Conflict ->
  push alert, branch and the running image stay on the last good release.
- **Image**: `.github/workflows/cosmoslab-build.yml` builds `ghcr.io/cosmoslab58/actual-server`
  on every push to `cosmoslab` (boot-tested first); Portainer stack 176 runs `:latest`.
- **Drop a patch** when Actual ships the same behavior: drop its commit (`git rebase` with a sequence editor, no `-i` prompt here) and push.
