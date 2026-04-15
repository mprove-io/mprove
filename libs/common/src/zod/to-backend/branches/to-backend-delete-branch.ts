import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDeleteBranchRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string()
  })
  .meta({ id: 'ToBackendDeleteBranchRequestPayload' });

export let zToBackendDeleteBranchRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteBranch)
  })
  .meta({ id: 'ToBackendDeleteBranchRequestInfo' });

export let zToBackendDeleteBranchRequest = zToBackendRequest
  .extend({
    info: zToBackendDeleteBranchRequestInfo,
    payload: zToBackendDeleteBranchRequestPayload
  })
  .meta({ id: 'ToBackendDeleteBranchRequest' });

export let zToBackendDeleteBranchResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendDeleteBranchResponsePayload' });

export let zToBackendDeleteBranchResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteBranch}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteBranchResponseInfo' });

export let zToBackendDeleteBranchResponse = zMyResponse
  .extend({
    info: zToBackendDeleteBranchResponseInfo,
    payload: zToBackendDeleteBranchResponsePayload
  })
  .meta({ id: 'ToBackendDeleteBranchResponse' });

export type ToBackendDeleteBranchRequestPayload = z.infer<
  typeof zToBackendDeleteBranchRequestPayload
>;
export type ToBackendDeleteBranchRequest = z.infer<
  typeof zToBackendDeleteBranchRequest
>;
export type ToBackendDeleteBranchResponsePayload = z.infer<
  typeof zToBackendDeleteBranchResponsePayload
>;
export type ToBackendDeleteBranchResponse = z.infer<
  typeof zToBackendDeleteBranchResponse
>;
