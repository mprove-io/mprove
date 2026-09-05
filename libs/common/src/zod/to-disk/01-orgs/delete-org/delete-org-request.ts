import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskDeleteOrgRequestInfo,
  zToDiskDeleteOrgRequestInfo
} from './delete-org-request-info';
import {
  type ToDiskDeleteOrgRequestPayload,
  zToDiskDeleteOrgRequestPayload
} from './delete-org-request-payload';

export type ToDiskDeleteOrgRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskDeleteOrgRequestInfo;
    payload: ToDiskDeleteOrgRequestPayload;
  }
>;

export let zToDiskDeleteOrgRequest = zToDiskRequest
  .extend({
    info: zToDiskDeleteOrgRequestInfo,
    payload: zToDiskDeleteOrgRequestPayload
  })
  .meta({ id: 'ToDiskDeleteOrgRequest' });

assertTypesEqual<
  ToDiskDeleteOrgRequest,
  z.infer<typeof zToDiskDeleteOrgRequest>
>({ value: true });
