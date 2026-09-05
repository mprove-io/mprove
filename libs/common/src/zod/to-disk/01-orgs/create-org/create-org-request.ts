import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskCreateOrgRequestInfo,
  zToDiskCreateOrgRequestInfo
} from './create-org-request-info';
import {
  type ToDiskCreateOrgRequestPayload,
  zToDiskCreateOrgRequestPayload
} from './create-org-request-payload';

export type ToDiskCreateOrgRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskCreateOrgRequestInfo;
    payload: ToDiskCreateOrgRequestPayload;
  }
>;

export let zToDiskCreateOrgRequest = zToDiskRequest
  .extend({
    info: zToDiskCreateOrgRequestInfo,
    payload: zToDiskCreateOrgRequestPayload
  })
  .meta({ id: 'ToDiskCreateOrgRequest' });

assertTypesEqual<
  ToDiskCreateOrgRequest,
  z.infer<typeof zToDiskCreateOrgRequest>
>({ value: true });
