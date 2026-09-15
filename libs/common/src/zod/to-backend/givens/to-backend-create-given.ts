import { z } from 'zod';
import { MyRegex } from '#common/classes/my-regex';
import { GivenTypeEnum } from '#common/enums/given-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zGiven } from '#common/zod/backend/given';
import { zMember } from '#common/zod/backend/member';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendCreateGivenRequestPayload = z
  .object({
    projectId: z.string(),
    givenId: z.string().regex(MyRegex.GIVEN_ID(), {
      message:
        'givenId must start with an uppercase letter or underscore and contain only uppercase letters, digits and underscores'
    }),
    type: z.enum(GivenTypeEnum),
    isMultiple: z.boolean(),
    values: z.array(z.string())
  })
  .meta({ id: 'ToBackendCreateGivenRequestPayload' });

export let zToBackendCreateGivenRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendCreateGiven)
  })
  .meta({ id: 'ToBackendCreateGivenRequestInfo' });

export let zToBackendCreateGivenRequest = zToBackendRequest
  .extend({
    info: zToBackendCreateGivenRequestInfo,
    payload: zToBackendCreateGivenRequestPayload
  })
  .meta({ id: 'ToBackendCreateGivenRequest' });

export let zToBackendCreateGivenResponsePayload = z
  .object({
    userMember: zMember,
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendCreateGivenResponsePayload' });

export let zToBackendCreateGivenResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateGiven}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateGivenResponseInfo' });

export let zToBackendCreateGivenResponse = zMyResponse
  .extend({
    info: zToBackendCreateGivenResponseInfo,
    payload: zToBackendCreateGivenResponsePayload
  })
  .meta({ id: 'ToBackendCreateGivenResponse' });

export type ToBackendCreateGivenRequestPayload = z.infer<
  typeof zToBackendCreateGivenRequestPayload
>;
export type ToBackendCreateGivenRequest = z.infer<
  typeof zToBackendCreateGivenRequest
>;
export type ToBackendCreateGivenResponsePayload = z.infer<
  typeof zToBackendCreateGivenResponsePayload
>;
export type ToBackendCreateGivenResponse = z.infer<
  typeof zToBackendCreateGivenResponse
>;
