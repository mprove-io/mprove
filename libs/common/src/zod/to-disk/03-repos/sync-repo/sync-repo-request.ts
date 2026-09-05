import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskSyncRepoRequestInfo,
  zToDiskSyncRepoRequestInfo
} from './sync-repo-request-info';
import {
  type ToDiskSyncRepoRequestPayload,
  zToDiskSyncRepoRequestPayload
} from './sync-repo-request-payload';

export type ToDiskSyncRepoRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskSyncRepoRequestInfo;
    payload?: ToDiskSyncRepoRequestPayload;
  }
>;

export let zToDiskSyncRepoRequest = zToDiskRequest
  .extend({
    info: zToDiskSyncRepoRequestInfo,
    payload: zToDiskSyncRepoRequestPayload
  })
  .meta({ id: 'ToDiskSyncRepoRequest' });

assertTypesEqual<ToDiskSyncRepoRequest, z.infer<typeof zToDiskSyncRepoRequest>>(
  { value: true }
);
