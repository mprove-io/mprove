import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const repoSyncScopeValues = [
  'nodes',
  'changesToCommit',
  'changesToPush'
] as const;

export type RepoSyncScope = (typeof repoSyncScopeValues)[number];

export let zRepoSyncScope = z.enum(repoSyncScopeValues);

assertTypesEqual<RepoSyncScope, z.infer<typeof zRepoSyncScope>>({
  value: true
});
