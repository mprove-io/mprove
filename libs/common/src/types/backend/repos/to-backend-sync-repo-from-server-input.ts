import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendSyncRepoBaseInput,
  zToBackendSyncRepoBaseInput
} from '#common/types/backend/repos/to-backend-sync-repo-base-input';
import type { Extend } from '#common/types/extend';

export type ToBackendSyncRepoFromServerInput = Extend<
  ToBackendSyncRepoBaseInput,
  {
    direction: 'from-server';
  }
>;

export let zToBackendSyncRepoFromServerInput =
  zToBackendSyncRepoBaseInput.extend({
    direction: z.literal('from-server')
  });

assertTypesEqual<
  ToBackendSyncRepoFromServerInput,
  z.infer<typeof zToBackendSyncRepoFromServerInput>
>({ value: true });
