import { z } from 'zod';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zSessionApi } from '#common/zod/backend/session-api';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetBranchesListRequestPayload = z
  .object({
    projectId: z.string()
  })
  .meta({ id: 'ToBackendGetBranchesListRequestPayload' });

export let zToBackendGetBranchesListRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetBranchesList)
  })
  .meta({ id: 'ToBackendGetBranchesListRequestInfo' });

export let zToBackendGetBranchesListRequest = zToBackendRequest
  .extend({
    info: zToBackendGetBranchesListRequestInfo,
    payload: zToBackendGetBranchesListRequestPayload
  })
  .meta({ id: 'ToBackendGetBranchesListRequest' });

export let zToBackendGetBranchesListResponsePayloadBranchesItem = z
  .object({
    repoId: z.string(),
    repoType: z.enum(RepoTypeEnum),
    branchId: z.string()
  })
  .meta({ id: 'ToBackendGetBranchesListResponsePayloadBranchesItem' });

export let zToBackendGetBranchesListResponsePayload = z
  .object({
    branchesList: z.array(zToBackendGetBranchesListResponsePayloadBranchesItem),
    sessionsList: z.array(zSessionApi),
    userMember: zMember
  })
  .meta({ id: 'ToBackendGetBranchesListResponsePayload' });

export let zToBackendGetBranchesListResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendGetBranchesList}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetBranchesListResponseInfo' });

export let zToBackendGetBranchesListResponse = zMyResponse
  .extend({
    info: zToBackendGetBranchesListResponseInfo,
    payload: zToBackendGetBranchesListResponsePayload
  })
  .meta({ id: 'ToBackendGetBranchesListResponse' });

export type ToBackendGetBranchesListRequestPayload = z.infer<
  typeof zToBackendGetBranchesListRequestPayload
>;
export type ToBackendGetBranchesListRequest = z.infer<
  typeof zToBackendGetBranchesListRequest
>;
export type ToBackendGetBranchesListResponsePayloadBranchesItem = z.infer<
  typeof zToBackendGetBranchesListResponsePayloadBranchesItem
>;
export type ToBackendGetBranchesListResponsePayload = z.infer<
  typeof zToBackendGetBranchesListResponsePayload
>;
export type ToBackendGetBranchesListResponse = z.infer<
  typeof zToBackendGetBranchesListResponse
>;
