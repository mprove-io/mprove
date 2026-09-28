import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSyncRepoOutput,
  zToBackendSyncRepoOutput
} from '#common/zod/backend/routes/repos/sync-repo/sync-repo-output';
import {
  type ToBackendSyncRepoError,
  zToBackendSyncRepoError
} from './sync-repo-error';

export type ToBackendSyncRepoResponse = ToBackendResponseBase<
  'syncRepo',
  ToBackendSyncRepoOutput,
  ToBackendSyncRepoError
>;

export let zToBackendSyncRepoResponse = makeToBackendResponseSchema({
  operation: 'syncRepo',
  output: zToBackendSyncRepoOutput,
  error: zToBackendSyncRepoError
}).meta({ id: 'ToBackendSyncRepoResponse' });

assertTypesEqual<
  ToBackendSyncRepoResponse,
  z.infer<typeof zToBackendSyncRepoResponse>
>({ value: true });
