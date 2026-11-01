# S Viewer releases

For every delivered update that changes `extra/s-viewer/`, bump the extension
version. Increment the patch version unless another version is requested. Do not
distribute changed extension code under a previously delivered version.

Keep `package.json`, `package-lock.json`, and versioned installation references
consistent with the new version. Build and package the updated VSIX before
handoff so the user only needs to run the installer.

Provide the following repository-root command in the session chat, replacing
`<version>` with the actual new packaged version, not a placeholder:

```sh
node extra/s-viewer/scripts/install.mjs \
  --vsix extra/s-viewer/dist/s-viewer-<version>.vsix \
  --require-remote
```

Tell the user to reload the VS Code window and reopen comparisons after
installation.
