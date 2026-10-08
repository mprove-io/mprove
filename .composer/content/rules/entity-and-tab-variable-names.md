# Entity and Tab variable names

For database entities and their converted Tab values:

- End a single entity's variable name with `Ent` (for example, `projectEnt`).
- End an entity collection's variable name with `Ents` (for example,
  `projectEnts`).
- Reserve the corresponding unsuffixed domain names for Tab values: `project`
  for `ProjectTab`, `projects` for `ProjectTab[]`. Do not add a `Tab` or `Tabs`
  suffix to these variable names.
- Apply the same distinction to collection callback parameters, function
  argument properties, and Result pipeline keys carrying entity or Tab values.
- Preserve descriptive prefixes: `connectionsWithFallbackEnts` contains
  entities, while `connectionsWithFallback` contains Tabs. API/base projections
  use explicit prefixes such as `apiProject` and `baseProject` to distinguish
  them from Tabs.

```ts
let projectEnt: ProjectEnt;

let project: ProjectTab;

let projectEnts: ProjectEnt[];

let projects: ProjectTab[];
```
