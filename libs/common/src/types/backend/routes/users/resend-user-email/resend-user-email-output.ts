import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendResendUserEmailOutput = {
  isEmailVerified: boolean;
};

export let zToBackendResendUserEmailOutput = z
  .object({
    isEmailVerified: z.boolean()
  })
  .meta({ id: 'ToBackendResendUserEmailOutput' });

assertTypesEqual<
  ToBackendResendUserEmailOutput,
  z.infer<typeof zToBackendResendUserEmailOutput>
>({ value: true });
