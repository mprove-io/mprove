import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendUpdateUserPasswordOutput = Record<string, never>;

export let zToBackendUpdateUserPasswordOutput = z
  .object({})
  .meta({ id: 'ToBackendUpdateUserPasswordOutput' });

assertTypesEqual<
  ToBackendUpdateUserPasswordOutput,
  z.infer<typeof zToBackendUpdateUserPasswordOutput>
>({ value: true });
