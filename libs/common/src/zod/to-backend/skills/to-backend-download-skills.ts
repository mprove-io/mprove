import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zSkillItem } from '#common/zod/backend/skill-item';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendDownloadSkillsRequestPayload = z
  .object({})
  .meta({ id: 'ToBackendDownloadSkillsRequestPayload' });

export let zToBackendDownloadSkillsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDownloadSkills)
  })
  .meta({ id: 'ToBackendDownloadSkillsRequestInfo' });

export let zToBackendDownloadSkillsRequest = zToBackendRequest
  .extend({
    info: zToBackendDownloadSkillsRequestInfo,
    payload: zToBackendDownloadSkillsRequestPayload
  })
  .meta({ id: 'ToBackendDownloadSkillsRequest' });

export let zToBackendDownloadSkillsResponsePayload = z
  .object({
    skillItems: z.array(zSkillItem)
  })
  .meta({ id: 'ToBackendDownloadSkillsResponsePayload' });

export let zToBackendDownloadSkillsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDownloadSkills}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDownloadSkillsResponseInfo' });

export let zToBackendDownloadSkillsResponse = zMyResponse
  .extend({
    info: zToBackendDownloadSkillsResponseInfo,
    payload: zToBackendDownloadSkillsResponsePayload
  })
  .meta({ id: 'ToBackendDownloadSkillsResponse' });

export type ToBackendDownloadSkillsRequestPayload = z.infer<
  typeof zToBackendDownloadSkillsRequestPayload
>;
export type ToBackendDownloadSkillsRequest = z.infer<
  typeof zToBackendDownloadSkillsRequest
>;
export type ToBackendDownloadSkillsResponsePayload = z.infer<
  typeof zToBackendDownloadSkillsResponsePayload
>;
export type ToBackendDownloadSkillsResponse = z.infer<
  typeof zToBackendDownloadSkillsResponse
>;
