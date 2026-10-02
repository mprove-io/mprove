import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendStartUserCodexAuthOutput = {
  userCode: string;
  verificationUrl: string;
  deviceAuthId: string;
  intervalSec: number;
};

export let zToBackendStartUserCodexAuthOutput = z
  .object({
    userCode: z.string(),
    verificationUrl: z.string(),
    deviceAuthId: z.string(),
    intervalSec: z.number()
  })
  .meta({ id: 'ToBackendStartUserCodexAuthOutput' });

assertTypesEqual<
  ToBackendStartUserCodexAuthOutput,
  z.infer<typeof zToBackendStartUserCodexAuthOutput>
>({ value: true });
