import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteFolderRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    folderNodeId: z.string()
  })
  .meta({ id: 'ToBackendDeleteFolderRequestPayload' });

export let zToBackendDeleteFolderRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteFolder)
  })
  .meta({ id: 'ToBackendDeleteFolderRequestInfo' });

export let zToBackendDeleteFolderRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteFolderRequestInfo,
    payload: zToBackendDeleteFolderRequestPayload
  })
  .meta({ id: 'ToBackendDeleteFolderRequest' });

export let zToBackendDeleteFolderResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendDeleteFolderResponsePayload' });

export let zToBackendDeleteFolderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteFolder}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteFolderResponseInfo' });

export let zToBackendDeleteFolderResponse = zMyResponse
  .extend({
    info: zToBackendDeleteFolderResponseInfo,
    payload: zToBackendDeleteFolderResponsePayload
  })
  .meta({ id: 'ToBackendDeleteFolderResponse' });

export type ToBackendDeleteFolderRequestPayload = z.infer<
  typeof zToBackendDeleteFolderRequestPayload
>;
export type ToBackendDeleteFolderRequest = z.infer<
  typeof zToBackendDeleteFolderRequest
>;
export type ToBackendDeleteFolderResponsePayload = z.infer<
  typeof zToBackendDeleteFolderResponsePayload
>;
export type ToBackendDeleteFolderResponse = z.infer<
  typeof zToBackendDeleteFolderResponse
>;
