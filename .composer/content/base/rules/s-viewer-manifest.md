# S Viewer manifest

Whenever changing repository files, maintain `.s-viewer/manifest.json` for the
complete HEAD → saved working-tree change set, not session history. Preserve
still-valid entries and provenance mappings; remove stale ones.

Explicitly account for every HEAD range in a changed text file through same-file
source mappings or `deletedRanges`. Cross-file mappings do not replace that
file's deletion accounting.

Follow [the S Viewer manifest guide](extra/s-viewer/docs/manifest.md) for the
schema, range/source mappings, repair behavior, and snapshot limitations.

From the repository root, run the package scripts with its package manager:

```sh
pnpm check-s-viewer
pnpm repair-s-viewer
```

For npm-managed repositories, use `npm run check-s-viewer` and
`npm run repair-s-viewer` instead. Each script targets its own repository's
manifest; checking a consumer repository does not check the extension
repository.

`check-s-viewer` is read-only and previews automatic fixes under `repairPlan`.
Edit the manifest manually or use `repair-s-viewer`, then restore/add
intentional provenance mappings as described in the guide.

After all edits, formatting, and generated files, finish with `check-s-viewer`
reporting no errors. The repository's `check` script also runs it after
typecheck and lint; neither command repairs automatically.
