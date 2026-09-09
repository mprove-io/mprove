import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

const gitFileStatusValues = [
  'not_added',
  'created',
  'deleted',
  'modified',
  'conflicted',
  'renamed'
] as const;

export type GitFileStatus = (typeof gitFileStatusValues)[number];

export let zGitFileStatus = z
  .enum(gitFileStatusValues)
  .meta({ id: 'GitFileStatus' });

assertTypesEqual<GitFileStatus, z.infer<typeof zGitFileStatus>>({
  value: true
});
