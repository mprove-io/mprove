import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type GitFileStatus =
  | 'not_added'
  | 'created'
  | 'deleted'
  | 'modified'
  | 'conflicted'
  | 'renamed';

export let zGitFileStatus = z
  .enum([
    'not_added',
    'created',
    'deleted',
    'modified',
    'conflicted',
    'renamed'
  ])
  .meta({ id: 'GitFileStatus' });

assertTypesEqual<GitFileStatus, z.infer<typeof zGitFileStatus>>({
  value: true
});
