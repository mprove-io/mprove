import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendValidateFilesRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendValidateFilesRequestPayload' });

export let zToBackendValidateFilesRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendValidateFiles)
  })
  .meta({ id: 'ToBackendValidateFilesRequestInfo' });

export let zToBackendValidateFilesRequest = zToBackendRequest
  .extend({
    info: zToBackendValidateFilesRequestInfo,
    payload: zToBackendValidateFilesRequestPayload
  })
  .meta({ id: 'ToBackendValidateFilesRequest' });

export let zToBackendValidateFilesResponsePayload = z
  .object({
    repo: zRepo,
    needValidate: z.boolean(),
    struct: zStructX
  })
  .meta({ id: 'ToBackendValidateFilesResponsePayload' });

export let zToBackendValidateFilesResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendValidateFiles}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendValidateFilesResponseInfo' });

export let zToBackendValidateFilesResponse = zMyResponse
  .extend({
    info: zToBackendValidateFilesResponseInfo,
    payload: zToBackendValidateFilesResponsePayload
  })
  .meta({ id: 'ToBackendValidateFilesResponse' });

export type ToBackendValidateFilesRequestPayload = z.infer<
  typeof zToBackendValidateFilesRequestPayload
>;
export type ToBackendValidateFilesRequest = z.infer<
  typeof zToBackendValidateFilesRequest
>;
export type ToBackendValidateFilesResponsePayload = z.infer<
  typeof zToBackendValidateFilesResponsePayload
>;
export type ToBackendValidateFilesResponse = z.infer<
  typeof zToBackendValidateFilesResponse
>;
