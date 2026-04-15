import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCloneTestRepoRequestPayload = z
  .object({
    orgId: z.string(),
    testId: z.string()
  })
  .meta({ id: 'ToBackendCloneTestRepoRequestPayload' });

export let zToBackendCloneTestRepoRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCloneTestRepo)
  })
  .meta({ id: 'ToBackendCloneTestRepoRequestInfo' });

export let zToBackendCloneTestRepoRequest = zToBackendRequest
  .extend({
    info: zToBackendCloneTestRepoRequestInfo,
    payload: zToBackendCloneTestRepoRequestPayload
  })
  .meta({ id: 'ToBackendCloneTestRepoRequest' });

export let zToBackendCloneTestRepoResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendCloneTestRepoResponsePayload' });

export let zToBackendCloneTestRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCloneTestRepo}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCloneTestRepoResponseInfo' });

export let zToBackendCloneTestRepoResponse = zMyResponse
  .extend({
    info: zToBackendCloneTestRepoResponseInfo,
    payload: zToBackendCloneTestRepoResponsePayload
  })
  .meta({ id: 'ToBackendCloneTestRepoResponse' });

export type ToBackendCloneTestRepoRequestPayload = z.infer<
  typeof zToBackendCloneTestRepoRequestPayload
>;
export type ToBackendCloneTestRepoRequest = z.infer<
  typeof zToBackendCloneTestRepoRequest
>;
export type ToBackendCloneTestRepoResponsePayload = z.infer<
  typeof zToBackendCloneTestRepoResponsePayload
>;
export type ToBackendCloneTestRepoResponse = z.infer<
  typeof zToBackendCloneTestRepoResponse
>;
