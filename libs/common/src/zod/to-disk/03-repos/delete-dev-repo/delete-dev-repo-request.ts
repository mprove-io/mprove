import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskDeleteDevRepoRequestInfo,
  zToDiskDeleteDevRepoRequestInfo
} from './delete-dev-repo-request-info';
import {
  type ToDiskDeleteDevRepoRequestPayload,
  zToDiskDeleteDevRepoRequestPayload
} from './delete-dev-repo-request-payload';

export type ToDiskDeleteDevRepoRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskDeleteDevRepoRequestInfo;
    payload: ToDiskDeleteDevRepoRequestPayload;
  }
>;

export let zToDiskDeleteDevRepoRequest = zToDiskRequest
  .extend({
    info: zToDiskDeleteDevRepoRequestInfo,
    payload: zToDiskDeleteDevRepoRequestPayload
  })
  .meta({ id: 'ToDiskDeleteDevRepoRequest' });

assertTypesEqual<
  ToDiskDeleteDevRepoRequest,
  z.infer<typeof zToDiskDeleteDevRepoRequest>
>({ value: true });
