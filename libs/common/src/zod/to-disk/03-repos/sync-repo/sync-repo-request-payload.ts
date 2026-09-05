import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type ToDiskSyncRepoFromServerRequestPayload,
  zToDiskSyncRepoFromServerRequestPayload
} from './sync-repo-from-server-request-payload';
import {
  type ToDiskSyncRepoToServerRequestPayload,
  zToDiskSyncRepoToServerRequestPayload
} from './sync-repo-to-server-request-payload';

export type ToDiskSyncRepoRequestPayload =
  | ToDiskSyncRepoToServerRequestPayload
  | ToDiskSyncRepoFromServerRequestPayload;

export let zToDiskSyncRepoRequestPayload = z
  .discriminatedUnion('direction', [
    zToDiskSyncRepoToServerRequestPayload,
    zToDiskSyncRepoFromServerRequestPayload
  ])
  .meta({ id: 'ToDiskSyncRepoRequestPayload' });

assertTypesEqual<
  ToDiskSyncRepoRequestPayload,
  z.infer<typeof zToDiskSyncRepoRequestPayload>
>({ value: true });
