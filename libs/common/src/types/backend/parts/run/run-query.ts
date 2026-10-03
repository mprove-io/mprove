import { z } from 'zod';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type RunQuery = {
  queryId: string;
  status: EnumValues<typeof QueryStatusEnum>;
  lastErrorMessage?: string;
};

export let zRunQuery = z
  .object({
    queryId: z.string(),
    status: z.enum(QueryStatusEnum),
    lastErrorMessage: z.string().nullish()
  })
  .meta({ id: 'RunQuery' });

assertTypesEqual<RunQuery, z.infer<typeof zRunQuery>>({ value: true });
