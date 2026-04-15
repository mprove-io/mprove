import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMconfigX } from '#common/zod/backend/mconfig-x';
import { zQuery } from '#common/zod/blockml/query';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDuplicateMconfigAndQueryRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    oldMconfigId: z.string()
  })
  .meta({ id: 'ToBackendDuplicateMconfigAndQueryRequestPayload' });

export let zToBackendDuplicateMconfigAndQueryRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(
      ToBackendRequestInfoNameEnum.ToBackendDuplicateMconfigAndQuery
    )
  })
  .meta({ id: 'ToBackendDuplicateMconfigAndQueryRequestInfo' });

export let zToBackendDuplicateMconfigAndQueryRequest = zToBackendRequest
  .extend({
    info: zToBackendDuplicateMconfigAndQueryRequestInfo,
    payload: zToBackendDuplicateMconfigAndQueryRequestPayload
  })
  .meta({ id: 'ToBackendDuplicateMconfigAndQueryRequest' });

export let zToBackendDuplicateMconfigAndQueryResponsePayload = z
  .object({
    mconfig: zMconfigX,
    query: zQuery
  })
  .meta({ id: 'ToBackendDuplicateMconfigAndQueryResponsePayload' });

export let zToBackendDuplicateMconfigAndQueryResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendDuplicateMconfigAndQuery}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDuplicateMconfigAndQueryResponseInfo' });

export let zToBackendDuplicateMconfigAndQueryResponse = zMyResponse
  .extend({
    info: zToBackendDuplicateMconfigAndQueryResponseInfo,
    payload: zToBackendDuplicateMconfigAndQueryResponsePayload
  })
  .meta({ id: 'ToBackendDuplicateMconfigAndQueryResponse' });

export type ToBackendDuplicateMconfigAndQueryRequestPayload = z.infer<
  typeof zToBackendDuplicateMconfigAndQueryRequestPayload
>;
export type ToBackendDuplicateMconfigAndQueryRequest = z.infer<
  typeof zToBackendDuplicateMconfigAndQueryRequest
>;
export type ToBackendDuplicateMconfigAndQueryResponsePayload = z.infer<
  typeof zToBackendDuplicateMconfigAndQueryResponsePayload
>;
export type ToBackendDuplicateMconfigAndQueryResponse = z.infer<
  typeof zToBackendDuplicateMconfigAndQueryResponse
>;
