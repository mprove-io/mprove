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

export type ToBackendSyncRepoRequest = {
  operation: 'syncRepo';
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSyncRepoToServerInput | ToBackendSyncRepoFromServerInput;
};

export let zToBackendSyncRepoRequest = z
  .strictObject({
    operation: z.literal('syncRepo'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .discriminatedUnion('direction', [
        zToBackendSyncRepoToServerInput,
        zToBackendSyncRepoFromServerInput
      ])
      .meta({ id: 'ToBackendSyncRepoInput' })
  })
  .transform(item => ({
    operation: item.operation,
    traceId: item.traceId,
    idempotencyKey: item.idempotencyKey,
    input: item.input
  }))
  .meta({ id: 'ToBackendSyncRepoRequest' });

assertTypesEqual<
  ToBackendSyncRepoRequest,
  z.infer<typeof zToBackendSyncRepoRequest>
>({ value: true });
