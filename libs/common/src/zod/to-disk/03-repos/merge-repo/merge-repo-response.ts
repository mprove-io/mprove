import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskMergeRepoResponseInfo,
  zToDiskMergeRepoResponseInfo
} from './merge-repo-response-info';
import {
  type ToDiskMergeRepoResponsePayload,
  zToDiskMergeRepoResponsePayload
} from './merge-repo-response-payload';

export type ToDiskMergeRepoResponse = Extend<
  MyResponse,
  {
    info: ToDiskMergeRepoResponseInfo;
    payload: ToDiskMergeRepoResponsePayload;
  }
>;

export let zToDiskMergeRepoResponse = zMyResponse
  .extend({
    info: zToDiskMergeRepoResponseInfo,
    payload: zToDiskMergeRepoResponsePayload
  })
  .meta({ id: 'ToDiskMergeRepoResponse' });

assertTypesEqual<
  ToDiskMergeRepoResponse,
  z.infer<typeof zToDiskMergeRepoResponse>
>({ value: true });
