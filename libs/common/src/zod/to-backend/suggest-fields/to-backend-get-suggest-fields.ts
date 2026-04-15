import { z } from 'zod';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zStructX } from '#common/zod/backend/struct-x';
import { zSuggestField } from '#common/zod/backend/suggest-field';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetSuggestFieldsRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    parentId: z.string(),
    parentType: z.enum(MconfigParentTypeEnum)
  })
  .meta({ id: 'ToBackendGetSuggestFieldsRequestPayload' });

export let zToBackendGetSuggestFieldsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetSuggestFields)
  })
  .meta({ id: 'ToBackendGetSuggestFieldsRequestInfo' });

export let zToBackendGetSuggestFieldsRequest = zToBackendRequest
  .extend({
    info: zToBackendGetSuggestFieldsRequestInfo,
    payload: zToBackendGetSuggestFieldsRequestPayload
  })
  .meta({ id: 'ToBackendGetSuggestFieldsRequest' });

export let zToBackendGetSuggestFieldsResponsePayload = z
  .object({
    needValidate: z.boolean(),
    struct: zStructX,
    userMember: zMember,
    suggestFields: z.array(zSuggestField)
  })
  .meta({ id: 'ToBackendGetSuggestFieldsResponsePayload' });

export let zToBackendGetSuggestFieldsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetSuggestFields}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetSuggestFieldsResponseInfo' });

export let zToBackendGetSuggestFieldsResponse = zMyResponse
  .extend({
    info: zToBackendGetSuggestFieldsResponseInfo,
    payload: zToBackendGetSuggestFieldsResponsePayload
  })
  .meta({ id: 'ToBackendGetSuggestFieldsResponse' });

export type ToBackendGetSuggestFieldsRequestPayload = z.infer<
  typeof zToBackendGetSuggestFieldsRequestPayload
>;
export type ToBackendGetSuggestFieldsRequest = z.infer<
  typeof zToBackendGetSuggestFieldsRequest
>;
export type ToBackendGetSuggestFieldsResponsePayload = z.infer<
  typeof zToBackendGetSuggestFieldsResponsePayload
>;
export type ToBackendGetSuggestFieldsResponse = z.infer<
  typeof zToBackendGetSuggestFieldsResponse
>;
