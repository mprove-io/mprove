import { z } from 'zod';
import { QueryOperationTypeEnum } from '#common/enums/query-operation-type.enum';
import { zFilter } from '#common/zod/blockml/filter';

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

export type QueryOperation = z.infer<typeof zQueryOperation>;
