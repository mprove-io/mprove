import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateFolderRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    parentNodeId: z.string(),
    folderName: z.string()
  })
  .meta({ id: 'ToBackendCreateFolderRequestPayload' });

export let zToBackendCreateFolderRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateFolder)
  })
  .meta({ id: 'ToBackendCreateFolderRequestInfo' });

export let zToBackendCreateFolderRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateFolderRequestInfo,
    payload: zToBackendCreateFolderRequestPayload
  })
  .meta({ id: 'ToBackendCreateFolderRequest' });

export let zToBackendCreateFolderResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendCreateFolderResponsePayload' });

export let zToBackendCreateFolderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateFolder}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateFolderResponseInfo' });

export let zToBackendCreateFolderResponse = zMyResponse
  .extend({
    info: zToBackendCreateFolderResponseInfo,
    payload: zToBackendCreateFolderResponsePayload
  })
  .meta({ id: 'ToBackendCreateFolderResponse' });

export type ToBackendCreateFolderRequestPayload = z.infer<
  typeof zToBackendCreateFolderRequestPayload
>;
export type ToBackendCreateFolderRequest = z.infer<
  typeof zToBackendCreateFolderRequest
>;
export type ToBackendCreateFolderResponsePayload = z.infer<
  typeof zToBackendCreateFolderResponsePayload
>;
export type ToBackendCreateFolderResponse = z.infer<
  typeof zToBackendCreateFolderResponse
>;
