import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const codexDeviceAuthStatusValues = [
  'Pending',
  'Authorized',
  'Failed'
] as const;

export type CodexDeviceAuthStatus =
  (typeof codexDeviceAuthStatusValues)[number];

export let zCodexDeviceAuthStatus = z.enum(codexDeviceAuthStatusValues);

assertTypesEqual<CodexDeviceAuthStatus, z.infer<typeof zCodexDeviceAuthStatus>>(
  {
    value: true
  }
);
