import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const toValues = ['remote', 'last-commit'] as const;

export type To = (typeof toValues)[number];

export let zTo = z.enum(toValues);

assertTypesEqual<To, z.infer<typeof zTo>>({
  value: true
});
