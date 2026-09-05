import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskCommitRepoResponseInfo,
  zToDiskCommitRepoResponseInfo
} from './commit-repo-response-info';
import {
  type ToDiskCommitRepoResponsePayload,
  zToDiskCommitRepoResponsePayload
} from './commit-repo-response-payload';

export type ToDiskCommitRepoResponse = Extend<
  MyResponse,
  {
    info: ToDiskCommitRepoResponseInfo;
    payload: ToDiskCommitRepoResponsePayload;
  }
>;

export let zToDiskCommitRepoResponse = zMyResponse
  .extend({
    info: zToDiskCommitRepoResponseInfo,
    payload: zToDiskCommitRepoResponsePayload
  })
  .meta({ id: 'ToDiskCommitRepoResponse' });

assertTypesEqual<
  ToDiskCommitRepoResponse,
  z.infer<typeof zToDiskCommitRepoResponse>
>({ value: true });
