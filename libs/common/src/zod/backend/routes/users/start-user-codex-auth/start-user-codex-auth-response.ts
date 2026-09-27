import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendStartUserCodexAuthError,
  zToBackendStartUserCodexAuthError
} from './start-user-codex-auth-error';

export type ToBackendStartUserCodexAuthOutput = {
  userCode: string;
  verificationUrl: string;
  deviceAuthId: string;
  intervalSec: number;
};

export type ToBackendStartUserCodexAuthResponse = ToBackendResponse<
  ToBackendStartUserCodexAuthOutput,
  ToBackendStartUserCodexAuthError
>;

export let zToBackendStartUserCodexAuthOutput = z
  .object({
    userCode: z.string(),
    verificationUrl: z.string(),
    deviceAuthId: z.string(),
    intervalSec: z.number()
  })
  .meta({ id: 'ToBackendStartUserCodexAuthOutput' });

export let zToBackendStartUserCodexAuthResponse = makeToBackendResponseSchema({
  success: zToBackendStartUserCodexAuthOutput,
  error: zToBackendStartUserCodexAuthError
}).meta({ id: 'ToBackendStartUserCodexAuthResponse' });

assertTypesEqual<
  ToBackendStartUserCodexAuthOutput,
  z.infer<typeof zToBackendStartUserCodexAuthOutput>
>({ value: true });

assertTypesEqual<
  ToBackendStartUserCodexAuthResponse,
  z.infer<typeof zToBackendStartUserCodexAuthResponse>
>({ value: true });
