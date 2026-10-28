# S Viewer manifest

Whenever changing repository files, maintain `.s-viewer/manifest.json` for the
complete HEAD → saved working-tree change set, not session history. Preserve
still-valid entries and provenance mappings; remove stale ones.

Follow [the S Viewer manifest guide](extra/s-viewer/docs/manifest.md) for the
schema, range/source mappings, repair behavior, and snapshot limitations.

From the repository root:

```sh
pnpm check-s-viewer
pnpm repair-s-viewer
```

`check-s-viewer` is read-only and previews automatic fixes under `repairPlan`.
Edit the manifest manually or use `repair-s-viewer`, then restore/add
intentional provenance mappings as described in the guide.

After all edits, formatting, and generated files, finish with `check-s-viewer`
reporting no errors. `pnpm check` also runs it after typecheck and lint; neither
command repairs automatically.

If `extra/s-viewer` is absent, check prints a warning and succeeds; repair
fails. When present, validation errors or a missing CLI/bundle fail the command.
