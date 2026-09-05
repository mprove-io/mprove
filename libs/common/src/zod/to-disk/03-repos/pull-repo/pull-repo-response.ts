import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskPullRepoResponseInfo,
  zToDiskPullRepoResponseInfo
} from './pull-repo-response-info';
import {
  type ToDiskPullRepoResponsePayload,
  zToDiskPullRepoResponsePayload
} from './pull-repo-response-payload';

export type ToDiskPullRepoResponse = Extend<
  MyResponse,
  {
    info: ToDiskPullRepoResponseInfo;
    payload: ToDiskPullRepoResponsePayload;
  }
>;

export let zToDiskPullRepoResponse = zMyResponse
  .extend({
    info: zToDiskPullRepoResponseInfo,
    payload: zToDiskPullRepoResponsePayload
  })
  .meta({ id: 'ToDiskPullRepoResponse' });

assertTypesEqual<
  ToDiskPullRepoResponse,
  z.infer<typeof zToDiskPullRepoResponse>
>({ value: true });
