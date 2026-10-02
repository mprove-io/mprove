import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type NoteSt = {
  emptyData?: number;
};

export let zNoteSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'NoteSt' });

assertTypesEqual<NoteSt, z.infer<typeof zNoteSt>>({ value: true });
