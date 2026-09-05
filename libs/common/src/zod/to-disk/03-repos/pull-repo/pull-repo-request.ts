import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskPullRepoRequestInfo,
  zToDiskPullRepoRequestInfo
} from './pull-repo-request-info';
import {
  type ToDiskPullRepoRequestPayload,
  zToDiskPullRepoRequestPayload
} from './pull-repo-request-payload';

export type ToDiskPullRepoRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskPullRepoRequestInfo;
    payload: ToDiskPullRepoRequestPayload;
  }
>;

export let zToDiskPullRepoRequest = zToDiskRequest
  .extend({
    info: zToDiskPullRepoRequestInfo,
    payload: zToDiskPullRepoRequestPayload
  })
  .meta({ id: 'ToDiskPullRepoRequest' });

assertTypesEqual<ToDiskPullRepoRequest, z.infer<typeof zToDiskPullRepoRequest>>(
  { value: true }
);
