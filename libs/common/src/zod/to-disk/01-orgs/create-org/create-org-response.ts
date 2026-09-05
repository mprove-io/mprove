import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskCreateOrgResponseInfo,
  zToDiskCreateOrgResponseInfo
} from './create-org-response-info';
import {
  type ToDiskCreateOrgResponsePayload,
  zToDiskCreateOrgResponsePayload
} from './create-org-response-payload';

export type ToDiskCreateOrgResponse = Extend<
  MyResponse,
  {
    info: ToDiskCreateOrgResponseInfo;
    payload: ToDiskCreateOrgResponsePayload;
  }
>;

export let zToDiskCreateOrgResponse = zMyResponse
  .extend({
    info: zToDiskCreateOrgResponseInfo,
    payload: zToDiskCreateOrgResponsePayload
  })
  .meta({ id: 'ToDiskCreateOrgResponse' });

assertTypesEqual<
  ToDiskCreateOrgResponse,
  z.infer<typeof zToDiskCreateOrgResponse>
>({ value: true });
