import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskSyncRepoBaseRequestPayload,
  zToDiskSyncRepoBaseRequestPayload
} from './sync-repo-base-request-payload';

export type ToDiskSyncRepoFromServerRequestPayload = Extend<
  ToDiskSyncRepoBaseRequestPayload,
  {
    direction: 'from-server';
  }
>;

export let zToDiskSyncRepoFromServerRequestPayload =
  zToDiskSyncRepoBaseRequestPayload.extend({
    direction: z.literal('from-server')
  });

assertTypesEqual<
  ToDiskSyncRepoFromServerRequestPayload,
  z.infer<typeof zToDiskSyncRepoFromServerRequestPayload>
>({ value: true });
