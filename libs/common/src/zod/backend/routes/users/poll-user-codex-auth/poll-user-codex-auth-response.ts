import { z } from 'zod';
import { CodexDeviceAuthStatusEnum } from '#common/enums/codex-device-auth-status.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type User, zUser } from '#common/zod/backend/user';
import {
  type ToBackendPollUserCodexAuthError,
  zToBackendPollUserCodexAuthError
} from './poll-user-codex-auth-error';

export type ToBackendPollUserCodexAuthOutput = {
  status:
    | CodexDeviceAuthStatusEnum.Pending
    | CodexDeviceAuthStatusEnum.Authorized
    | CodexDeviceAuthStatusEnum.Failed;
  user?: User;
};

export type ToBackendPollUserCodexAuthResponse = ToBackendResponse<
  ToBackendPollUserCodexAuthOutput,
  ToBackendPollUserCodexAuthError
>;

export let zToBackendPollUserCodexAuthOutput = z
  .object({
    status: z.enum(CodexDeviceAuthStatusEnum),
    user: zUser.nullish()
  })
  .meta({ id: 'ToBackendPollUserCodexAuthOutput' });

export let zToBackendPollUserCodexAuthResponse = makeToBackendResponseSchema({
  success: zToBackendPollUserCodexAuthOutput,
  error: zToBackendPollUserCodexAuthError
}).meta({ id: 'ToBackendPollUserCodexAuthResponse' });

assertTypesEqual<
  ToBackendPollUserCodexAuthOutput,
  z.infer<typeof zToBackendPollUserCodexAuthOutput>
>({ value: true });

assertTypesEqual<
  ToBackendPollUserCodexAuthResponse,
  z.infer<typeof zToBackendPollUserCodexAuthResponse>
>({ value: true });
