import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

const repoStatusValues = ['NeedCommit', 'NeedPull', 'NeedPush', 'Ok'] as const;

export type RepoStatus = (typeof repoStatusValues)[number];

export let zRepoStatus = z.enum(repoStatusValues);

assertTypesEqual<RepoStatus, z.infer<typeof zRepoStatus>>({
  value: true
});
