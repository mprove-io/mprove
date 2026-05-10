import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zSkillItem } from '#common/zod/backend/skill-item';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendGetSkillsRequestPayload = z
  .object({})
  .meta({ id: 'ToBackendGetSkillsRequestPayload' });

export let zToBackendGetSkillsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetSkills)
  })
  .meta({ id: 'ToBackendGetSkillsRequestInfo' });

export let zToBackendGetSkillsRequest = zToBackendRequest
  .extend({
    info: zToBackendGetSkillsRequestInfo,
    payload: zToBackendGetSkillsRequestPayload
  })
  .meta({ id: 'ToBackendGetSkillsRequest' });

export let zToBackendGetSkillsResponsePayload = z
  .object({
    skillItems: z.array(zSkillItem)
  })
  .meta({ id: 'ToBackendGetSkillsResponsePayload' });

export let zToBackendGetSkillsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetSkills}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetSkillsResponseInfo' });

export let zToBackendGetSkillsResponse = zMyResponse
  .extend({
    info: zToBackendGetSkillsResponseInfo,
    payload: zToBackendGetSkillsResponsePayload
  })
  .meta({ id: 'ToBackendGetSkillsResponse' });

export type ToBackendGetSkillsRequestPayload = z.infer<
  typeof zToBackendGetSkillsRequestPayload
>;
export type ToBackendGetSkillsRequest = z.infer<
  typeof zToBackendGetSkillsRequest
>;
export type ToBackendGetSkillsResponsePayload = z.infer<
  typeof zToBackendGetSkillsResponsePayload
>;
export type ToBackendGetSkillsResponse = z.infer<
  typeof zToBackendGetSkillsResponse
>;
