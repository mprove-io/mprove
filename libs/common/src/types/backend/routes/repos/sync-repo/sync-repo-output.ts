import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendSyncRepoFromServerOutput,
  zToBackendSyncRepoFromServerOutput
} from '#common/types/backend/parts/repos/to-backend-sync-repo-from-server-output';
import {
  type ToBackendSyncRepoToServerOutput,
  zToBackendSyncRepoToServerOutput
} from '#common/types/backend/parts/repos/to-backend-sync-repo-to-server-output';

export type ToBackendSyncRepoOutput =
  | ToBackendSyncRepoToServerOutput
  | ToBackendSyncRepoFromServerOutput;

export let zToBackendSyncRepoOutput = z
  .discriminatedUnion('direction', [
    zToBackendSyncRepoToServerOutput,
    zToBackendSyncRepoFromServerOutput
  ])
  .meta({ id: 'ToBackendSyncRepoOutput' });

assertTypesEqual<
  ToBackendSyncRepoOutput,
  z.infer<typeof zToBackendSyncRepoOutput>
>({ value: true });
