import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateBranchRequestPayload = z
  .object({
    projectId: z.string(),
    newBranchId: z.string(),
    fromBranchId: z.string(),
    repoId: z.string()
  })
  .meta({ id: 'ToBackendCreateBranchRequestPayload' });

export let zToBackendCreateBranchRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateBranch)
  })
  .meta({ id: 'ToBackendCreateBranchRequestInfo' });

export let zToBackendCreateBranchRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateBranchRequestInfo,
    payload: zToBackendCreateBranchRequestPayload
  })
  .meta({ id: 'ToBackendCreateBranchRequest' });

export let zToBackendCreateBranchResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendCreateBranchResponsePayload' });

export let zToBackendCreateBranchResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateBranch}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateBranchResponseInfo' });

export let zToBackendCreateBranchResponse = zMyResponse
  .extend({
    info: zToBackendCreateBranchResponseInfo,
    payload: zToBackendCreateBranchResponsePayload
  })
  .meta({ id: 'ToBackendCreateBranchResponse' });

export type ToBackendCreateBranchRequestPayload = z.infer<
  typeof zToBackendCreateBranchRequestPayload
>;
export type ToBackendCreateBranchRequest = z.infer<
  typeof zToBackendCreateBranchRequest
>;
export type ToBackendCreateBranchResponsePayload = z.infer<
  typeof zToBackendCreateBranchResponsePayload
>;
export type ToBackendCreateBranchResponse = z.infer<
  typeof zToBackendCreateBranchResponse
>;
