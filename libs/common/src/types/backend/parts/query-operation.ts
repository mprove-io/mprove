import { z } from 'zod';
import { QueryOperationTypeEnum } from '#common/enums/query-operation-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Filter, zFilter } from '#common/types/blockml/parts/filter';
import type { EnumValues } from '#common/types/enum-values';

export type QueryOperation = {
  type: EnumValues<typeof QueryOperationTypeEnum>;
  timezone: string;
  limit?: number;
  fieldId?: string;
  filters?: Filter[];
  sortFieldId?: string;
  desc?: boolean;
  replaceWithFieldId?: string;
  moveFieldIds?: string[];
};

export let zQueryOperation = z
  .object({
    type: z.enum(QueryOperationTypeEnum),
    timezone: z.string(),
    limit: z.number().int().nullish(),
    fieldId: z.string().nullish(),
    filters: z.array(zFilter).nullish(),
    sortFieldId: z.string().nullish(),
    desc: z.boolean().nullish(),
    replaceWithFieldId: z.string().nullish(),
    moveFieldIds: z.array(z.string()).nullish()
  })
  .meta({ id: 'QueryOperation' });

assertTypesEqual<QueryOperation, z.infer<typeof zQueryOperation>>({
  value: true
});
