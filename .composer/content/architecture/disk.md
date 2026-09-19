# Disk

File system and git repository management service. Manages project file storage
and git operations.

## Purpose

Manages the file system layer for Mprove projects:

- Git repository operations
- File operations within repositories
- Folder management
- Organization/project/git-repo files tree structure
- Seed data initialization

## Communication

- Receives Valkey (Redis) RPC messages from backend
- Operates on local filesystem (`mprove_data/` directory)
- Uses SimpleGit for git operations
