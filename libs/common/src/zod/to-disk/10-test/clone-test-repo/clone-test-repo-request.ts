import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskCloneTestRepoRequestInfo,
  zToDiskCloneTestRepoRequestInfo
} from './clone-test-repo-request-info';
import {
  type ToDiskCloneTestRepoRequestPayload,
  zToDiskCloneTestRepoRequestPayload
} from './clone-test-repo-request-payload';

export type ToDiskCloneTestRepoRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskCloneTestRepoRequestInfo;
    payload: ToDiskCloneTestRepoRequestPayload;
  }
>;

export let zToDiskCloneTestRepoRequest = zToDiskRequest
  .extend({
    info: zToDiskCloneTestRepoRequestInfo,
    payload: zToDiskCloneTestRepoRequestPayload
  })
  .meta({ id: 'ToDiskCloneTestRepoRequest' });

assertTypesEqual<
  ToDiskCloneTestRepoRequest,
  z.infer<typeof zToDiskCloneTestRepoRequest>
>({ value: true });
