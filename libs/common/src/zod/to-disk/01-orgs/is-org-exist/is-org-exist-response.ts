import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskIsOrgExistResponseInfo,
  zToDiskIsOrgExistResponseInfo
} from './is-org-exist-response-info';
import {
  type ToDiskIsOrgExistResponsePayload,
  zToDiskIsOrgExistResponsePayload
} from './is-org-exist-response-payload';

export type ToDiskIsOrgExistResponse = Extend<
  MyResponse,
  {
    info: ToDiskIsOrgExistResponseInfo;
    payload: ToDiskIsOrgExistResponsePayload;
  }
>;

export let zToDiskIsOrgExistResponse = zMyResponse
  .extend({
    info: zToDiskIsOrgExistResponseInfo,
    payload: zToDiskIsOrgExistResponsePayload
  })
  .meta({ id: 'ToDiskIsOrgExistResponse' });

assertTypesEqual<
  ToDiskIsOrgExistResponse,
  z.infer<typeof zToDiskIsOrgExistResponse>
>({ value: true });
