import { z } from 'zod';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zMember } from '#common/zod/backend/member';
import { zRole } from '#common/zod/backend/role';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateRoleRequestPayload = z
  .object({
    projectId: z.string(),
    roleId: z.string().regex(MyRegex.ROLE_ID(), {
      message:
        'roleId must start with a lowercase letter or underscore and contain only lowercase letters, digits and underscores'
    })
  })
  .meta({ id: 'ToBackendCreateRoleRequestPayload' });

export let zToBackendCreateRoleRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateRole)
  })
  .meta({ id: 'ToBackendCreateRoleRequestInfo' });

export let zToBackendCreateRoleRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateRoleRequestInfo,
    payload: zToBackendCreateRoleRequestPayload
  })
  .meta({ id: 'ToBackendCreateRoleRequest' });

export let zToBackendCreateRoleResponsePayload = z
  .object({
    userMember: zMember,
    roles: z.array(zRole)
  })
  .meta({ id: 'ToBackendCreateRoleResponsePayload' });

export let zToBackendCreateRoleResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateRole}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateRoleResponseInfo' });

export let zToBackendCreateRoleResponse = zMyResponse
  .extend({
    info: zToBackendCreateRoleResponseInfo,
    payload: zToBackendCreateRoleResponsePayload
  })
  .meta({ id: 'ToBackendCreateRoleResponse' });

export type ToBackendCreateRoleRequestPayload = z.infer<
  typeof zToBackendCreateRoleRequestPayload
>;
export type ToBackendCreateRoleRequest = z.infer<
  typeof zToBackendCreateRoleRequest
>;
export type ToBackendCreateRoleResponsePayload = z.infer<
  typeof zToBackendCreateRoleResponsePayload
>;
export type ToBackendCreateRoleResponse = z.infer<
  typeof zToBackendCreateRoleResponse
>;
