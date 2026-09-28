import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendLogoutUserOutput = Record<string, never>;

export let zToBackendLogoutUserOutput = z
  .object({})
  .meta({ id: 'ToBackendLogoutUserOutput' });

assertTypesEqual<
  ToBackendLogoutUserOutput,
  z.infer<typeof zToBackendLogoutUserOutput>
>({ value: true });
