import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskCommitRepoRequestInfo,
  zToDiskCommitRepoRequestInfo
} from './commit-repo-request-info';
import {
  type ToDiskCommitRepoRequestPayload,
  zToDiskCommitRepoRequestPayload
} from './commit-repo-request-payload';

export type ToDiskCommitRepoRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskCommitRepoRequestInfo;
    payload: ToDiskCommitRepoRequestPayload;
  }
>;

export let zToDiskCommitRepoRequest = zToDiskRequest
  .extend({
    info: zToDiskCommitRepoRequestInfo,
    payload: zToDiskCommitRepoRequestPayload
  })
  .meta({ id: 'ToDiskCommitRepoRequest' });

assertTypesEqual<
  ToDiskCommitRepoRequest,
  z.infer<typeof zToDiskCommitRepoRequest>
>({ value: true });
