import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type KitLt = {
  data: any;
};

export let zKitLt = z.object({ data: z.any() }).meta({ id: 'KitLt' });

assertTypesEqual<KitLt, z.infer<typeof zKitLt>>({ value: true });
