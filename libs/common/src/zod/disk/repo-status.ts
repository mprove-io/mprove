import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type RepoStatus = 'NeedCommit' | 'NeedPull' | 'NeedPush' | 'Ok';

export let zRepoStatus = z.enum(['NeedCommit', 'NeedPull', 'NeedPush', 'Ok']);

assertTypesEqual<RepoStatus, z.infer<typeof zRepoStatus>>({
  value: true
});
