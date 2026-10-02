import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OrgLt = {
  emptyData?: number;
};

export let zOrgLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'OrgLt' });

assertTypesEqual<OrgLt, z.infer<typeof zOrgLt>>({ value: true });
