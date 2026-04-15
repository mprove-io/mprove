import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendIsBranchExistRequestPayload = z
  .object({
    projectId: z.string(),
    branchId: z.string(),
    repoId: z.string()
  })
  .meta({ id: 'ToBackendIsBranchExistRequestPayload' });

export let zToBackendIsBranchExistRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendIsBranchExist)
  })
  .meta({ id: 'ToBackendIsBranchExistRequestInfo' });

export let zToBackendIsBranchExistRequest = zToBackendRequest
  .extend({
    info: zToBackendIsBranchExistRequestInfo,
    payload: zToBackendIsBranchExistRequestPayload
  })
  .meta({ id: 'ToBackendIsBranchExistRequest' });

export let zToBackendIsBranchExistResponsePayload = z
  .object({
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendIsBranchExistResponsePayload' });

export let zToBackendIsBranchExistResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendIsBranchExist}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendIsBranchExistResponseInfo' });

export let zToBackendIsBranchExistResponse = zMyResponse
  .extend({
    info: zToBackendIsBranchExistResponseInfo,
    payload: zToBackendIsBranchExistResponsePayload
  })
  .meta({ id: 'ToBackendIsBranchExistResponse' });

export type ToBackendIsBranchExistRequestPayload = z.infer<
  typeof zToBackendIsBranchExistRequestPayload
>;
export type ToBackendIsBranchExistRequest = z.infer<
  typeof zToBackendIsBranchExistRequest
>;
export type ToBackendIsBranchExistResponsePayload = z.infer<
  typeof zToBackendIsBranchExistResponsePayload
>;
export type ToBackendIsBranchExistResponse = z.infer<
  typeof zToBackendIsBranchExistResponse
>;
