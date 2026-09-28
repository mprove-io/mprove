import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteOrgOutput = Record<string, never>;

export let zToBackendDeleteOrgOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteOrgOutput' });

assertTypesEqual<
  ToBackendDeleteOrgOutput,
  z.infer<typeof zToBackendDeleteOrgOutput>
>({ value: true });
