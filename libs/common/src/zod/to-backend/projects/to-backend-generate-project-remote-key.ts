import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGenerateProjectRemoteKeyRequestPayload = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToBackendGenerateProjectRemoteKeyRequestPayload' });

export let zToBackendGenerateProjectRemoteKeyRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(
      ToBackendRequestInfoNameEnum.ToBackendGenerateProjectRemoteKey
    )
  })
  .meta({ id: 'ToBackendGenerateProjectRemoteKeyRequestInfo' });

export let zToBackendGenerateProjectRemoteKeyRequest = zToBackendRequest
  .extend({
    info: zToBackendGenerateProjectRemoteKeyRequestInfo,
    payload: zToBackendGenerateProjectRemoteKeyRequestPayload
  })
  .meta({ id: 'ToBackendGenerateProjectRemoteKeyRequest' });

export let zToBackendGenerateProjectRemoteKeyResponsePayload = z
  .object({
    noteId: z.string(),
    publicKey: z.string()
  })
  .meta({ id: 'ToBackendGenerateProjectRemoteKeyResponsePayload' });

export let zToBackendGenerateProjectRemoteKeyResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGenerateProjectRemoteKey}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGenerateProjectRemoteKeyResponseInfo' });

export let zToBackendGenerateProjectRemoteKeyResponse = zMyResponse
  .extend({
    info: zToBackendGenerateProjectRemoteKeyResponseInfo,
    payload: zToBackendGenerateProjectRemoteKeyResponsePayload
  })
  .meta({ id: 'ToBackendGenerateProjectRemoteKeyResponse' });

export type ToBackendGenerateProjectRemoteKeyRequestPayload = z.infer<
  typeof zToBackendGenerateProjectRemoteKeyRequestPayload
>;
export type ToBackendGenerateProjectRemoteKeyRequest = z.infer<
  typeof zToBackendGenerateProjectRemoteKeyRequest
>;
export type ToBackendGenerateProjectRemoteKeyResponsePayload = z.infer<
  typeof zToBackendGenerateProjectRemoteKeyResponsePayload
>;
export type ToBackendGenerateProjectRemoteKeyResponse = z.infer<
  typeof zToBackendGenerateProjectRemoteKeyResponse
>;
