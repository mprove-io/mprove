import { z } from 'zod';
import { zUser } from '#common/zod/backend/user';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';

export let zToBackendSetUserNameRequestPayload = z
  .object({
    firstName: z.string(),
    lastName: z.string()
  })
  .meta({ id: 'ToBackendSetUserNameRequestPayload' });

export let zToBackendSetUserNameRequest = zToBackendRequest
  .extend({
    payload: zToBackendSetUserNameRequestPayload
  })
  .meta({ id: 'ToBackendSetUserNameRequest' });

export let zToBackendSetUserNameResponsePayload = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendSetUserNameResponsePayload' });

export let zToBackendSetUserNameResponse = zMyResponse
  .extend({
    payload: zToBackendSetUserNameResponsePayload
  })
  .meta({ id: 'ToBackendSetUserNameResponse' });

export type ToBackendSetUserNameRequestPayload = z.infer<
  typeof zToBackendSetUserNameRequestPayload
>;
export type ToBackendSetUserNameRequest = z.infer<
  typeof zToBackendSetUserNameRequest
>;
export type ToBackendSetUserNameResponsePayload = z.infer<
  typeof zToBackendSetUserNameResponsePayload
>;
export type ToBackendSetUserNameResponse = z.infer<
  typeof zToBackendSetUserNameResponse
>;
