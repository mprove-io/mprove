import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendResetUserPasswordOutput = Record<string, never>;

export let zToBackendResetUserPasswordOutput = z
  .object({})
  .meta({ id: 'ToBackendResetUserPasswordOutput' });

assertTypesEqual<
  ToBackendResetUserPasswordOutput,
  z.infer<typeof zToBackendResetUserPasswordOutput>
>({ value: true });
