import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { CodexDeviceAuthStatus } from '#common/types/backend/parts/codex/codex-device-auth-status';
import { zCodexDeviceAuthStatus } from '#common/types/backend/parts/codex/codex-device-auth-status';
import { type User, zUser } from '#common/types/backend/parts/user';

export type ToBackendPollUserCodexAuthOutput = {
  status: CodexDeviceAuthStatus;
  user?: User;
};

export let zToBackendPollUserCodexAuthOutput = z
  .object({
    status: zCodexDeviceAuthStatus,
    user: zUser.nullish()
  })
  .meta({ id: 'ToBackendPollUserCodexAuthOutput' });

assertTypesEqual<
  ToBackendPollUserCodexAuthOutput,
  z.infer<typeof zToBackendPollUserCodexAuthOutput>
>({ value: true });
