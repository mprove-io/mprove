import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type MemberLt = {
  emptyData?: number;
};

export let zMemberLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'MemberLt' });

assertTypesEqual<MemberLt, z.infer<typeof zMemberLt>>({ value: true });
