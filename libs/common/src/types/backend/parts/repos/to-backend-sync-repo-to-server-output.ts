import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendSyncRepoBaseOutput,
  zToBackendSyncRepoBaseOutput
} from '#common/types/backend/parts/repos/to-backend-sync-repo-base-output';
import type { Extend } from '#common/types/extend';

export type ToBackendSyncRepoToServerOutput = Extend<
  ToBackendSyncRepoBaseOutput,
  {
    direction: 'to-server';
    appliedChangesOnServer: string[];
  }
>;

export let zToBackendSyncRepoToServerOutput =
  zToBackendSyncRepoBaseOutput.extend({
    direction: z.literal('to-server'),
    appliedChangesOnServer: z.array(z.string())
  });

assertTypesEqual<
  ToBackendSyncRepoToServerOutput,
  z.infer<typeof zToBackendSyncRepoToServerOutput>
>({ value: true });
