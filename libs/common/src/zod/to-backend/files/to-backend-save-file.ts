import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSaveFileRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fileNodeId: z.string(),
    content: z.string()
  })
  .meta({ id: 'ToBackendSaveFileRequestPayload' });

export let zToBackendSaveFileRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSaveFile)
  })
  .meta({ id: 'ToBackendSaveFileRequestInfo' });

export let zToBackendSaveFileRequest = zToBackendRequest
  .extend({
    info: zToBackendSaveFileRequestInfo,
    payload: zToBackendSaveFileRequestPayload
  })
  .meta({ id: 'ToBackendSaveFileRequest' });

export let zToBackendSaveFileResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendSaveFileResponsePayload' });

export let zToBackendSaveFileResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendSaveFile}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSaveFileResponseInfo' });

export let zToBackendSaveFileResponse = zMyResponse
  .extend({
    info: zToBackendSaveFileResponseInfo,
    payload: zToBackendSaveFileResponsePayload
  })
  .meta({ id: 'ToBackendSaveFileResponse' });

export type ToBackendSaveFileRequestPayload = z.infer<
  typeof zToBackendSaveFileRequestPayload
>;
export type ToBackendSaveFileRequest = z.infer<
  typeof zToBackendSaveFileRequest
>;
export type ToBackendSaveFileResponsePayload = z.infer<
  typeof zToBackendSaveFileResponsePayload
>;
export type ToBackendSaveFileResponse = z.infer<
  typeof zToBackendSaveFileResponse
>;
