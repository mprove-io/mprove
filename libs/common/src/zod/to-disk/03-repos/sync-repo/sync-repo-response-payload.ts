import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type ToDiskSyncRepoFromServerResponsePayload,
  zToDiskSyncRepoFromServerResponsePayload
} from './sync-repo-from-server-response-payload';
import {
  type ToDiskSyncRepoToServerResponsePayload,
  zToDiskSyncRepoToServerResponsePayload
} from './sync-repo-to-server-response-payload';

export type ToDiskSyncRepoResponsePayload =
  | ToDiskSyncRepoToServerResponsePayload
  | ToDiskSyncRepoFromServerResponsePayload;

export let zToDiskSyncRepoResponsePayload = z
  .discriminatedUnion('direction', [
    zToDiskSyncRepoToServerResponsePayload,
    zToDiskSyncRepoFromServerResponsePayload
  ])
  .meta({ id: 'ToDiskSyncRepoResponsePayload' });

assertTypesEqual<
  ToDiskSyncRepoResponsePayload,
  z.infer<typeof zToDiskSyncRepoResponsePayload>
>({ value: true });
