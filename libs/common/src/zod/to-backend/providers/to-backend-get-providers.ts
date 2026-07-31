import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zProvider } from '#common/zod/backend/provider';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetProvidersRequestPayload = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetProvidersRequestPayload' });

export let zToBackendGetProvidersRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetProviders)
  })
  .meta({ id: 'ToBackendGetProvidersRequestInfo' });

export let zToBackendGetProvidersRequest = zToBackendRequest
  .extend({
    info: zToBackendGetProvidersRequestInfo,
    payload: zToBackendGetProvidersRequestPayload
  })
  .meta({ id: 'ToBackendGetProvidersRequest' });

export let zToBackendGetProvidersResponsePayload = z
  .object({
    userMember: zMember,
    providers: z.array(zProvider)
  })
  .meta({ id: 'ToBackendGetProvidersResponsePayload' });

export let zToBackendGetProvidersResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetProviders}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetProvidersResponseInfo' });

export let zToBackendGetProvidersResponse = zMyResponse
  .extend({
    info: zToBackendGetProvidersResponseInfo,
    payload: zToBackendGetProvidersResponsePayload
  })
  .meta({ id: 'ToBackendGetProvidersResponse' });

export type ToBackendGetProvidersRequestPayload = z.infer<
  typeof zToBackendGetProvidersRequestPayload
>;
export type ToBackendGetProvidersRequest = z.infer<
  typeof zToBackendGetProvidersRequest
>;
export type ToBackendGetProvidersResponsePayload = z.infer<
  typeof zToBackendGetProvidersResponsePayload
>;
export type ToBackendGetProvidersResponse = z.infer<
  typeof zToBackendGetProvidersResponse
>;
