import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskMergeRepoRequestInfo,
  zToDiskMergeRepoRequestInfo
} from './merge-repo-request-info';
import {
  type ToDiskMergeRepoRequestPayload,
  zToDiskMergeRepoRequestPayload
} from './merge-repo-request-payload';

export type ToDiskMergeRepoRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskMergeRepoRequestInfo;
    payload: ToDiskMergeRepoRequestPayload;
  }
>;

export let zToDiskMergeRepoRequest = zToDiskRequest
  .extend({
    info: zToDiskMergeRepoRequestInfo,
    payload: zToDiskMergeRepoRequestPayload
  })
  .meta({ id: 'ToDiskMergeRepoRequest' });

assertTypesEqual<
  ToDiskMergeRepoRequest,
  z.infer<typeof zToDiskMergeRepoRequest>
>({ value: true });
