import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zModelInfo } from '#common/zod/backend/model-info';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateFileRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    parentNodeId: z.string(),
    fileName: z.string(),
    modelInfo: zModelInfo.nullish()
  })
  .meta({ id: 'ToBackendCreateFileRequestPayload' });

export let zToBackendCreateFileRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateFile)
  })
  .meta({ id: 'ToBackendCreateFileRequestInfo' });

export let zToBackendCreateFileRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateFileRequestInfo,
    payload: zToBackendCreateFileRequestPayload
  })
  .meta({ id: 'ToBackendCreateFileRequest' });

export let zToBackendCreateFileResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendCreateFileResponsePayload' });

export let zToBackendCreateFileResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateFile}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateFileResponseInfo' });

export let zToBackendCreateFileResponse = zMyResponse
  .extend({
    info: zToBackendCreateFileResponseInfo,
    payload: zToBackendCreateFileResponsePayload
  })
  .meta({ id: 'ToBackendCreateFileResponse' });

export type ToBackendCreateFileRequestPayload = z.infer<
  typeof zToBackendCreateFileRequestPayload
>;
export type ToBackendCreateFileRequest = z.infer<
  typeof zToBackendCreateFileRequest
>;
export type ToBackendCreateFileResponsePayload = z.infer<
  typeof zToBackendCreateFileResponsePayload
>;
export type ToBackendCreateFileResponse = z.infer<
  typeof zToBackendCreateFileResponse
>;
