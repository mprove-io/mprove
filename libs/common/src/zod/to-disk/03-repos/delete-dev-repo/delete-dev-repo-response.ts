import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskDeleteDevRepoResponseInfo,
  zToDiskDeleteDevRepoResponseInfo
} from './delete-dev-repo-response-info';
import {
  type ToDiskDeleteDevRepoResponsePayload,
  zToDiskDeleteDevRepoResponsePayload
} from './delete-dev-repo-response-payload';

export type ToDiskDeleteDevRepoResponse = Extend<
  MyResponse,
  {
    info: ToDiskDeleteDevRepoResponseInfo;
    payload: ToDiskDeleteDevRepoResponsePayload;
  }
>;

export let zToDiskDeleteDevRepoResponse = zMyResponse
  .extend({
    info: zToDiskDeleteDevRepoResponseInfo,
    payload: zToDiskDeleteDevRepoResponsePayload
  })
  .meta({ id: 'ToDiskDeleteDevRepoResponse' });

assertTypesEqual<
  ToDiskDeleteDevRepoResponse,
  z.infer<typeof zToDiskDeleteDevRepoResponse>
>({ value: true });
