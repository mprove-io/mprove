import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskCreateDevRepoResponseInfo,
  zToDiskCreateDevRepoResponseInfo
} from './create-dev-repo-response-info';
import {
  type ToDiskCreateDevRepoResponsePayload,
  zToDiskCreateDevRepoResponsePayload
} from './create-dev-repo-response-payload';

export type ToDiskCreateDevRepoResponse = Extend<
  MyResponse,
  {
    info: ToDiskCreateDevRepoResponseInfo;
    payload: ToDiskCreateDevRepoResponsePayload;
  }
>;

export let zToDiskCreateDevRepoResponse = zMyResponse
  .extend({
    info: zToDiskCreateDevRepoResponseInfo,
    payload: zToDiskCreateDevRepoResponsePayload
  })
  .meta({ id: 'ToDiskCreateDevRepoResponse' });

assertTypesEqual<
  ToDiskCreateDevRepoResponse,
  z.infer<typeof zToDiskCreateDevRepoResponse>
>({ value: true });
