import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteFileRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fileNodeId: z.string()
  })
  .meta({ id: 'ToBackendDeleteFileRequestPayload' });

export let zToBackendDeleteFileRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteFile)
  })
  .meta({ id: 'ToBackendDeleteFileRequestInfo' });

export let zToBackendDeleteFileRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteFileRequestInfo,
    payload: zToBackendDeleteFileRequestPayload
  })
  .meta({ id: 'ToBackendDeleteFileRequest' });

export let zToBackendDeleteFileResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendDeleteFileResponsePayload' });

export let zToBackendDeleteFileResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteFile}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteFileResponseInfo' });

export let zToBackendDeleteFileResponse = zMyResponse
  .extend({
    info: zToBackendDeleteFileResponseInfo,
    payload: zToBackendDeleteFileResponsePayload
  })
  .meta({ id: 'ToBackendDeleteFileResponse' });

export type ToBackendDeleteFileRequestPayload = z.infer<
  typeof zToBackendDeleteFileRequestPayload
>;
export type ToBackendDeleteFileRequest = z.infer<
  typeof zToBackendDeleteFileRequest
>;
export type ToBackendDeleteFileResponsePayload = z.infer<
  typeof zToBackendDeleteFileResponsePayload
>;
export type ToBackendDeleteFileResponse = z.infer<
  typeof zToBackendDeleteFileResponse
>;
