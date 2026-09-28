import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendPushRepoOutput,
  zToBackendPushRepoOutput
} from '#common/zod/backend/routes/repos/push-repo/push-repo-output';
import {
  type ToBackendPushRepoError,
  zToBackendPushRepoError
} from './push-repo-error';

export type ToBackendPushRepoResponse = ToBackendResponseBase<
  'pushRepo',
  ToBackendPushRepoOutput,
  ToBackendPushRepoError
>;

export let zToBackendPushRepoResponse = makeToBackendResponseSchema({
  operation: 'pushRepo',
  output: zToBackendPushRepoOutput,
  error: zToBackendPushRepoError
}).meta({ id: 'ToBackendPushRepoResponse' });

assertTypesEqual<
  ToBackendPushRepoResponse,
  z.infer<typeof zToBackendPushRepoResponse>
>({ value: true });
