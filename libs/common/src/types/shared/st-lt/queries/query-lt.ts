import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type QueryLt = {
  data: any;
};

export let zQueryLt = z.object({ data: z.any() }).meta({ id: 'QueryLt' });

assertTypesEqual<QueryLt, z.infer<typeof zQueryLt>>({ value: true });
