import { z } from 'zod';
import { CodexDeviceAuthStatusEnum } from '#common/enums/codex-device-auth-status.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type User, zUser } from '#common/types/backend/parts/user';

export type ToBackendPollUserCodexAuthOutput = {
  status:
    | CodexDeviceAuthStatusEnum.Pending
    | CodexDeviceAuthStatusEnum.Authorized
    | CodexDeviceAuthStatusEnum.Failed;
  user?: User;
};

export let zToBackendPollUserCodexAuthOutput = z
  .object({
    status: z.enum(CodexDeviceAuthStatusEnum),
    user: zUser.nullish()
  })
  .meta({ id: 'ToBackendPollUserCodexAuthOutput' });

assertTypesEqual<
  ToBackendPollUserCodexAuthOutput,
  z.infer<typeof zToBackendPollUserCodexAuthOutput>
>({ value: true });
