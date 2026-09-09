import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type RepoError = 'NoCommonAncestor' | 'ChangesToPushNotCalculated';

export let zRepoError = z.enum([
  'NoCommonAncestor',
  'ChangesToPushNotCalculated'
]);

assertTypesEqual<RepoError, z.infer<typeof zRepoError>>({
  value: true
});
