import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskDeleteOrgResponseInfo,
  zToDiskDeleteOrgResponseInfo
} from './delete-org-response-info';
import {
  type ToDiskDeleteOrgResponsePayload,
  zToDiskDeleteOrgResponsePayload
} from './delete-org-response-payload';

export type ToDiskDeleteOrgResponse = Extend<
  MyResponse,
  {
    info: ToDiskDeleteOrgResponseInfo;
    payload: ToDiskDeleteOrgResponsePayload;
  }
>;

export let zToDiskDeleteOrgResponse = zMyResponse
  .extend({
    info: zToDiskDeleteOrgResponseInfo,
    payload: zToDiskDeleteOrgResponsePayload
  })
  .meta({ id: 'ToDiskDeleteOrgResponse' });

assertTypesEqual<
  ToDiskDeleteOrgResponse,
  z.infer<typeof zToDiskDeleteOrgResponse>
>({ value: true });
