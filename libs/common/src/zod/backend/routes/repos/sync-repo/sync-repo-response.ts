import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendSyncRepoFromServerOutput,
  zToBackendSyncRepoFromServerOutput
} from '#common/zod/backend/repos/to-backend-sync-repo-from-server-output';
import {
  type ToBackendSyncRepoToServerOutput,
  zToBackendSyncRepoToServerOutput
} from '#common/zod/backend/repos/to-backend-sync-repo-to-server-output';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendSyncRepoError,
  zToBackendSyncRepoError
} from './sync-repo-error';

export type ToBackendSyncRepoOutput =
  | ToBackendSyncRepoToServerOutput
  | ToBackendSyncRepoFromServerOutput;

export type ToBackendSyncRepoResponse = ToBackendResponse<
  ToBackendSyncRepoOutput,
  ToBackendSyncRepoError
>;

export let zToBackendSyncRepoOutput = z
  .discriminatedUnion('direction', [
    zToBackendSyncRepoToServerOutput,
    zToBackendSyncRepoFromServerOutput
  ])
  .meta({ id: 'ToBackendSyncRepoOutput' });

export let zToBackendSyncRepoResponse = makeToBackendResponseSchema({
  success: zToBackendSyncRepoOutput,
  error: zToBackendSyncRepoError
}).meta({ id: 'ToBackendSyncRepoResponse' });

assertTypesEqual<
  ToBackendSyncRepoOutput,
  z.infer<typeof zToBackendSyncRepoOutput>
>({ value: true });

assertTypesEqual<
  ToBackendSyncRepoResponse,
  z.infer<typeof zToBackendSyncRepoResponse>
>({ value: true });
