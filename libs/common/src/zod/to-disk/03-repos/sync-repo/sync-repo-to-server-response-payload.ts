import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskSyncRepoBaseResponsePayload,
  zToDiskSyncRepoBaseResponsePayload
} from './sync-repo-base-response-payload';

export type ToDiskSyncRepoToServerResponsePayload = Extend<
  ToDiskSyncRepoBaseResponsePayload,
  {
    direction: 'to-server';
    appliedChangesOnServer: string[];
  }
>;

export let zToDiskSyncRepoToServerResponsePayload =
  zToDiskSyncRepoBaseResponsePayload.extend({
    direction: z.literal('to-server'),
    appliedChangesOnServer: z.array(z.string())
  });

assertTypesEqual<
  ToDiskSyncRepoToServerResponsePayload,
  z.infer<typeof zToDiskSyncRepoToServerResponsePayload>
>({ value: true });
