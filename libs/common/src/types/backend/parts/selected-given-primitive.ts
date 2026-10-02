import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type SelectedGivenPrimitive = string | boolean;

export let zSelectedGivenPrimitive = z.union([z.string(), z.boolean()]);

assertTypesEqual<
  SelectedGivenPrimitive,
  z.infer<typeof zSelectedGivenPrimitive>
>({ value: true });
