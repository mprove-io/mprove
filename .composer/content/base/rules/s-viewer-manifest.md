# S Viewer manifest

Whenever changing repository files, maintain `.s-viewer/manifest.json` for the
complete HEAD → saved working-tree change set, not session history. Preserve
still-valid entries and provenance mappings; remove stale ones.

Explicitly account for every HEAD range in a changed text file through same-file
source mappings or `deletedRanges`. Cross-file mappings do not replace that
file's deletion accounting.

Author and semantically review provenance mappings against HEAD and current
text. Tools validate mappings; they do not generate them. Successful validation
does not establish provenance correctness. Follow the semantic-review checklist
in [the S Viewer manifest guide](extra/s-viewer/docs/manifest.md), which also
defines the schema, mapping workflow, and snapshot limitations.

From the repository root, run the package scripts with its package manager:

```sh
pnpm check-s-viewer
```

For npm-managed repositories, use `npm run check-s-viewer` instead. Each script
targets its own repository's manifest; checking a consumer repository does not
check the extension repository.

`check-s-viewer` is read-only. Resolve diagnostics by inspecting the actual text
and editing the manifest yourself, not by inventing additions or deletions just
to satisfy coverage. Review mappings before updating content hashes.

After all edits, formatting, and generated files, finish with `check-s-viewer`
reporting no errors. The repository's `check` script also runs it after
typecheck and lint; neither command changes the manifest.
