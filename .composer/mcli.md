# Mcli

Command-line interface for Mprove, built with Clipanion.

## Package Management

mcli uses **bun** as package manager (independent from turbo/pnpm workspace).

Dependency versions are centrally managed in `pnpm-workspace.yaml` catalog. Run
`pnpm catalog-write` from project root to sync catalog versions to
`package.json`.

## Communication

- Communicates with backend via HTTP API
- Uses same DTOs/interfaces as the frontend
