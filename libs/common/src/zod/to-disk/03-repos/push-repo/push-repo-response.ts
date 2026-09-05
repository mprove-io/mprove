import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskPushRepoResponseInfo,
  zToDiskPushRepoResponseInfo
} from './push-repo-response-info';
import {
  type ToDiskPushRepoResponsePayload,
  zToDiskPushRepoResponsePayload
} from './push-repo-response-payload';

export type ToDiskPushRepoResponse = Extend<
  MyResponse,
  {
    info: ToDiskPushRepoResponseInfo;
    payload: ToDiskPushRepoResponsePayload;
  }
>;

export let zToDiskPushRepoResponse = zMyResponse
  .extend({
    info: zToDiskPushRepoResponseInfo,
    payload: zToDiskPushRepoResponsePayload
  })
  .meta({ id: 'ToDiskPushRepoResponse' });

assertTypesEqual<
  ToDiskPushRepoResponse,
  z.infer<typeof zToDiskPushRepoResponse>
>({ value: true });
