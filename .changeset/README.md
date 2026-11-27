# Changesets

PRs touching `packages/core`, `packages/theme-base`, or `packages/theme-default` need a changeset: run `pnpm changeset` and follow the prompts, targeting `main`.

Release flow: merging a changeset to `main` lets the `release` workflow open a version PR. Merging that version PR back to `main` is what should get tagged (`git tag vX.Y.Z && git push --tags`) to trigger npm publish.

See https://github.com/changesets/changesets for details.
