import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteMemberOutput = Record<string, never>;

export let zToBackendDeleteMemberOutput = z
  .object({})
  .meta({ id: 'ToBackendDeleteMemberOutput' });

assertTypesEqual<
  ToBackendDeleteMemberOutput,
  z.infer<typeof zToBackendDeleteMemberOutput>
>({ value: true });
