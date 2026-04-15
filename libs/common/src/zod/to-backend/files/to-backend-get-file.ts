import { z } from 'zod';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetFileRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fileNodeId: z.string(),
    builderLeft: z.enum(BuilderLeftEnum)
  })
  .meta({ id: 'ToBackendGetFileRequestPayload' });

export let zToBackendGetFileRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetFile)
  })
  .meta({ id: 'ToBackendGetFileRequestInfo' });

export let zToBackendGetFileRequest = zToBackendRequest
  .extend({
    info: zToBackendGetFileRequestInfo,
    payload: zToBackendGetFileRequestPayload
  })
  .meta({ id: 'ToBackendGetFileRequest' });

export let zToBackendGetFileResponsePayload = z
  .object({
    repo: zRepo,
    originalContent: z.string(),
    content: z.string(),
    struct: zStructX,
    needValidate: z.boolean(),
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendGetFileResponsePayload' });

export let zToBackendGetFileResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetFile}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetFileResponseInfo' });

export let zToBackendGetFileResponse = zMyResponse
  .extend({
    info: zToBackendGetFileResponseInfo,
    payload: zToBackendGetFileResponsePayload
  })
  .meta({ id: 'ToBackendGetFileResponse' });

export type ToBackendGetFileRequestPayload = z.infer<
  typeof zToBackendGetFileRequestPayload
>;
export type ToBackendGetFileRequest = z.infer<typeof zToBackendGetFileRequest>;
export type ToBackendGetFileResponsePayload = z.infer<
  typeof zToBackendGetFileResponsePayload
>;
export type ToBackendGetFileResponse = z.infer<
  typeof zToBackendGetFileResponse
>;
