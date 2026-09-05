import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskCreateDevRepoRequestInfo,
  zToDiskCreateDevRepoRequestInfo
} from './create-dev-repo-request-info';
import {
  type ToDiskCreateDevRepoRequestPayload,
  zToDiskCreateDevRepoRequestPayload
} from './create-dev-repo-request-payload';

export type ToDiskCreateDevRepoRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskCreateDevRepoRequestInfo;
    payload: ToDiskCreateDevRepoRequestPayload;
  }
>;

export let zToDiskCreateDevRepoRequest = zToDiskRequest
  .extend({
    info: zToDiskCreateDevRepoRequestInfo,
    payload: zToDiskCreateDevRepoRequestPayload
  })
  .meta({ id: 'ToDiskCreateDevRepoRequest' });

assertTypesEqual<
  ToDiskCreateDevRepoRequest,
  z.infer<typeof zToDiskCreateDevRepoRequest>
>({ value: true });
