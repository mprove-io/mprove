import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetRepoOutput,
  zToBackendGetRepoOutput
} from '#common/zod/backend/routes/repos/get-repo/get-repo-output';
import {
  type ToBackendGetRepoError,
  zToBackendGetRepoError
} from './get-repo-error';

export type ToBackendGetRepoResponse = ToBackendResponseBase<
  'getRepo',
  ToBackendGetRepoOutput,
  ToBackendGetRepoError
>;

export let zToBackendGetRepoResponse = makeToBackendResponseSchema({
  operation: 'getRepo',
  output: zToBackendGetRepoOutput,
  error: zToBackendGetRepoError
}).meta({ id: 'ToBackendGetRepoResponse' });

assertTypesEqual<
  ToBackendGetRepoResponse,
  z.infer<typeof zToBackendGetRepoResponse>
>({ value: true });
