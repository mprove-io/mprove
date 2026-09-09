import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type RepoStatusEtype = 'NeedCommit' | 'NeedPull' | 'NeedPush' | 'Ok';

export let zRepoStatusEtype = z.enum([
  'NeedCommit',
  'NeedPull',
  'NeedPush',
  'Ok'
]);

assertTypesEqual<RepoStatusEtype, z.infer<typeof zRepoStatusEtype>>({
  value: true
});
