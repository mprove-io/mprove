import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetSessionTitleOutput = Record<string, never>;

export let zToBackendSetSessionTitleOutput = z
  .object({})
  .meta({ id: 'ToBackendSetSessionTitleOutput' });

assertTypesEqual<
  ToBackendSetSessionTitleOutput,
  z.infer<typeof zToBackendSetSessionTitleOutput>
>({ value: true });
