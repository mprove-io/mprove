import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type RepoErrorEtype = 'NoCommonAncestor' | 'ChangesToPushNotCalculated';

export let zRepoErrorEtype = z.enum([
  'NoCommonAncestor',
  'ChangesToPushNotCalculated'
]);

assertTypesEqual<RepoErrorEtype, z.infer<typeof zRepoErrorEtype>>({
  value: true
});
