import { z } from 'zod';
import { MyRegex } from '#common/classes/my-regex';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zGiven } from '#common/zod/backend/given';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendEditGivenRequestPayload = z
  .object({
    projectId: z.string(),
    givenId: z.string().regex(MyRegex.GIVEN_ID(), {
      message:
        'givenId must start with an uppercase letter or underscore and contain only uppercase letters, digits and underscores'
    }),
    values: z.array(z.string())
  })
  .meta({ id: 'ToBackendEditGivenRequestPayload' });

export let zToBackendEditGivenRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditGiven)
  })
  .meta({ id: 'ToBackendEditGivenRequestInfo' });

export let zToBackendEditGivenRequest = zToBackendRequest
  .extend({
    info: zToBackendEditGivenRequestInfo,
    payload: zToBackendEditGivenRequestPayload
  })
  .meta({ id: 'ToBackendEditGivenRequest' });

export let zToBackendEditGivenResponsePayload = z
  .object({
    userMember: zMember,
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendEditGivenResponsePayload' });

export let zToBackendEditGivenResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendEditGiven}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditGivenResponseInfo' });

export let zToBackendEditGivenResponse = zMyResponse
  .extend({
    info: zToBackendEditGivenResponseInfo,
    payload: zToBackendEditGivenResponsePayload
  })
  .meta({ id: 'ToBackendEditGivenResponse' });

export type ToBackendEditGivenRequestPayload = z.infer<
  typeof zToBackendEditGivenRequestPayload
>;
export type ToBackendEditGivenRequest = z.infer<
  typeof zToBackendEditGivenRequest
>;
export type ToBackendEditGivenResponsePayload = z.infer<
  typeof zToBackendEditGivenResponsePayload
>;
export type ToBackendEditGivenResponse = z.infer<
  typeof zToBackendEditGivenResponse
>;
