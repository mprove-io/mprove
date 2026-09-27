import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendSyncRepoBaseInput,
  zToBackendSyncRepoBaseInput
} from '#common/zod/backend/repos/to-backend-sync-repo-base-input';

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
