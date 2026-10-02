import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendPullRepoOutput,
  zToBackendPullRepoOutput
} from '#common/types/backend/routes/repos/pull-repo/pull-repo-output';
import {
  type ToBackendPullRepoError,
  zToBackendPullRepoError
} from './pull-repo-error';

export type ToBackendPullRepoResponse = ToBackendResponseBase<
  'pullRepo',
  ToBackendPullRepoOutput,
  ToBackendPullRepoError
>;

export let zToBackendPullRepoResponse = makeToBackendResponseSchema({
  operation: 'pullRepo',
  output: zToBackendPullRepoOutput,
  error: zToBackendPullRepoError
}).meta({ id: 'ToBackendPullRepoResponse' });

assertTypesEqual<
  ToBackendPullRepoResponse,
  z.infer<typeof zToBackendPullRepoResponse>
>({ value: true });
