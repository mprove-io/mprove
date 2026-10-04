import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryOperationType,
  zQueryOperationType
} from '#common/types/backend/parts/query-operation/query-operation-type';
import {
  type Filter,
  zFilter
} from '#common/types/blockml/parts/filter/filter';

export type QueryOperation = {
  type: QueryOperationType;
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
    type: zQueryOperationType,
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
