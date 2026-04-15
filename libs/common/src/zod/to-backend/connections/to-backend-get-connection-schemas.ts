import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zCombinedSchemaItem } from '#common/zod/backend/connection-schemas/combined-schema';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetConnectionSchemasRequestPayload = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    isRefreshExistingCache: z.boolean()
  })
  .meta({ id: 'ToBackendGetConnectionSchemasRequestPayload' });

export let zToBackendGetConnectionSchemasRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetConnectionSchemas)
  })
  .meta({ id: 'ToBackendGetConnectionSchemasRequestInfo' });

export let zToBackendGetConnectionSchemasRequest = zToBackendRequest
  .extend({
    info: zToBackendGetConnectionSchemasRequestInfo,
    payload: zToBackendGetConnectionSchemasRequestPayload
  })
  .meta({ id: 'ToBackendGetConnectionSchemasRequest' });

export let zToBackendGetConnectionSchemasResponsePayload = z
  .object({
    userMember: zMember,
    combinedSchemaItems: z.array(zCombinedSchemaItem)
  })
  .meta({ id: 'ToBackendGetConnectionSchemasResponsePayload' });

export let zToBackendGetConnectionSchemasResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetConnectionSchemas}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetConnectionSchemasResponseInfo' });

export let zToBackendGetConnectionSchemasResponse = zMyResponse
  .extend({
    info: zToBackendGetConnectionSchemasResponseInfo,
    payload: zToBackendGetConnectionSchemasResponsePayload
  })
  .meta({ id: 'ToBackendGetConnectionSchemasResponse' });

export type ToBackendGetConnectionSchemasRequestPayload = z.infer<
  typeof zToBackendGetConnectionSchemasRequestPayload
>;
export type ToBackendGetConnectionSchemasRequest = z.infer<
  typeof zToBackendGetConnectionSchemasRequest
>;
export type ToBackendGetConnectionSchemasResponsePayload = z.infer<
  typeof zToBackendGetConnectionSchemasResponsePayload
>;
export type ToBackendGetConnectionSchemasResponse = z.infer<
  typeof zToBackendGetConnectionSchemasResponse
>;
