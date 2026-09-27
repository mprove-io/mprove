import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendSyncRepoFromServerInput,
  zToBackendSyncRepoFromServerInput
} from '#common/zod/backend/repos/to-backend-sync-repo-from-server-input';
import {
  type ToBackendSyncRepoToServerInput,
  zToBackendSyncRepoToServerInput
} from '#common/zod/backend/repos/to-backend-sync-repo-to-server-input';

export type ToBackendSyncRepoInput =
  | ToBackendSyncRepoToServerInput
  | ToBackendSyncRepoFromServerInput;

export type ToBackendSyncRepoRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSyncRepoInput;
};

export let zToBackendSyncRepoInput = z
  .discriminatedUnion('direction', [
    zToBackendSyncRepoToServerInput,
    zToBackendSyncRepoFromServerInput
  ])
  .meta({ id: 'ToBackendSyncRepoInput' });

export let zToBackendSyncRepoRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSyncRepoInput
  })
  .transform(item => ({
    traceId: item.traceId,
    idempotencyKey: item.idempotencyKey,
    input: item.input
  }))
  .meta({ id: 'ToBackendSyncRepoRequest' });

assertTypesEqual<
  ToBackendSyncRepoInput,
  z.infer<typeof zToBackendSyncRepoInput>
>({ value: true });

assertTypesEqual<
  ToBackendSyncRepoRequest,
  z.infer<typeof zToBackendSyncRepoRequest>
>({ value: true });
