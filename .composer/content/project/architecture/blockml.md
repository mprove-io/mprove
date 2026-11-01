# Blockml

Malloy/BlockML model compilation service. Receives compilation requests from
backend via Valkey (Redis) RPC and returns compiled struct.

## Purpose

Compiles BlockML model definitions (YAML-based) into executable query
structures. The compilation pipeline:

1. Receives file tree from backend
2. Parses Malloy/BlockML model definitions
3. Validates model structure
4. Produces compiled struct

## Communication

- Listens for Valkey (Redis) RPC messages from backend
- Returns compiled structures or compilation errors
