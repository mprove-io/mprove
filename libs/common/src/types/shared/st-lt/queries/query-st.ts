import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type QuerySt = {
  sql: string;
  lastErrorMessage: string;
  apiMethod: string;
  apiUrl: string;
  apiBody: string;
};

export let zQuerySt = z
  .object({
    sql: z.string(),
    lastErrorMessage: z.string(),
    apiMethod: z.string(),
    apiUrl: z.string(),
    apiBody: z.string()
  })
  .meta({ id: 'QuerySt' });

assertTypesEqual<QuerySt, z.infer<typeof zQuerySt>>({ value: true });
