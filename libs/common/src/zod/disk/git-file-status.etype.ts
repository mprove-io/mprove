import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type GitFileStatusEtype =
  | 'not_added'
  | 'created'
  | 'deleted'
  | 'modified'
  | 'conflicted'
  | 'renamed';

export let zGitFileStatusEtype = z
  .enum([
    'not_added',
    'created',
    'deleted',
    'modified',
    'conflicted',
    'renamed'
  ])
  .meta({ id: 'GitFileStatusEtype' });

assertTypesEqual<GitFileStatusEtype, z.infer<typeof zGitFileStatusEtype>>({
  value: true
});
