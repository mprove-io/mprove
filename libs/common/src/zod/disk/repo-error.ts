import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

const repoErrorValues = [
  'NoCommonAncestor',
  'ChangesToPushNotCalculated'
] as const;

export type RepoError = (typeof repoErrorValues)[number];

export let zRepoError = z.enum(repoErrorValues);

assertTypesEqual<RepoError, z.infer<typeof zRepoError>>({
  value: true
});
