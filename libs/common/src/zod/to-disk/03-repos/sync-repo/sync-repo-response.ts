import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskSyncRepoResponseInfo,
  zToDiskSyncRepoResponseInfo
} from './sync-repo-response-info';
import {
  type ToDiskSyncRepoResponsePayload,
  zToDiskSyncRepoResponsePayload
} from './sync-repo-response-payload';

export type ToDiskSyncRepoResponse = Extend<
  MyResponse,
  {
    info: ToDiskSyncRepoResponseInfo;
    payload?: ToDiskSyncRepoResponsePayload;
  }
>;

export let zToDiskSyncRepoResponse = zMyResponse
  .extend({
    info: zToDiskSyncRepoResponseInfo,
    payload: zToDiskSyncRepoResponsePayload
  })
  .meta({ id: 'ToDiskSyncRepoResponse' });

assertTypesEqual<
  ToDiskSyncRepoResponse,
  z.infer<typeof zToDiskSyncRepoResponse>
>({ value: true });
