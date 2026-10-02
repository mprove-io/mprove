import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSeedRecordsInputCachedPartsItem = {
  projectId: string;
  connectionId: string;
  envId: string;
  schemaNameLc: string;
  tableNameLc: string;
  columnNameLc: string;
  columnValue?: string;
  columnValueLc?: string;
  count: number;
};

export let zToBackendSeedRecordsInputCachedPartsItem = z
  .object({
    projectId: z.string(),
    connectionId: z.string(),
    envId: z.string(),
    schemaNameLc: z.string(),
    tableNameLc: z.string(),
    columnNameLc: z.string(),
    columnValue: z.string().nullish(),
    columnValueLc: z.string().nullish(),
    count: z.number()
  })
  .meta({ id: 'ToBackendSeedRecordsInputCachedPartsItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputCachedPartsItem,
  z.infer<typeof zToBackendSeedRecordsInputCachedPartsItem>
>({ value: true });
