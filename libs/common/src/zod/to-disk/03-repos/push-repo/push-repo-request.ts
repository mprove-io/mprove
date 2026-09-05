import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskPushRepoRequestInfo,
  zToDiskPushRepoRequestInfo
} from './push-repo-request-info';
import {
  type ToDiskPushRepoRequestPayload,
  zToDiskPushRepoRequestPayload
} from './push-repo-request-payload';

export type ToDiskPushRepoRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskPushRepoRequestInfo;
    payload: ToDiskPushRepoRequestPayload;
  }
>;

export let zToDiskPushRepoRequest = zToDiskRequest
  .extend({
    info: zToDiskPushRepoRequestInfo,
    payload: zToDiskPushRepoRequestPayload
  })
  .meta({ id: 'ToDiskPushRepoRequest' });

assertTypesEqual<ToDiskPushRepoRequest, z.infer<typeof zToDiskPushRepoRequest>>(
  { value: true }
);
