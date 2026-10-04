const gitFileStatusValues = [
  'not_added',
  'created',
  'deleted',
  'modified',
  'conflicted',
  'renamed'
] as const;

export type GitFileStatus = (typeof gitFileStatusValues)[number];
