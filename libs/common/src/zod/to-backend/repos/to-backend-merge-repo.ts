import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zStructX } from '#common/zod/backend/struct-x';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendMergeRepoRequestPayload = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    theirBranchId: z.string(),
    isTheirBranchRemote: z.boolean()
  })
  .meta({ id: 'ToBackendMergeRepoRequestPayload' });

export let zToBackendMergeRepoRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendMergeRepo)
  })
  .meta({ id: 'ToBackendMergeRepoRequestInfo' });

export let zToBackendMergeRepoRequest = zToBackendRequest
  .extend({
    info: zToBackendMergeRepoRequestInfo,
    payload: zToBackendMergeRepoRequestPayload
  })
  .meta({ id: 'ToBackendMergeRepoRequest' });

export let zToBackendMergeRepoResponsePayload = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendMergeRepoResponsePayload' });

export let zToBackendMergeRepoResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendMergeRepo}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendMergeRepoResponseInfo' });

export let zToBackendMergeRepoResponse = zMyResponse
  .extend({
    info: zToBackendMergeRepoResponseInfo,
    payload: zToBackendMergeRepoResponsePayload
  })
  .meta({ id: 'ToBackendMergeRepoResponse' });

export type ToBackendMergeRepoRequestPayload = z.infer<
  typeof zToBackendMergeRepoRequestPayload
>;
export type ToBackendMergeRepoRequest = z.infer<
  typeof zToBackendMergeRepoRequest
>;
export type ToBackendMergeRepoResponsePayload = z.infer<
  typeof zToBackendMergeRepoResponsePayload
>;
export type ToBackendMergeRepoResponse = z.infer<
  typeof zToBackendMergeRepoResponse
>;
