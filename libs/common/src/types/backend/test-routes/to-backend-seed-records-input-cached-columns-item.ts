import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSeedRecordsInputCachedColumnsItem = {
  projectId: string;
  connectionId: string;
  envId: string;
  schemaNameLc: string;
  tableNameLc: string;
  columnNameLc: string;
  status: 'running' | 'completed' | 'error';
  limit: number;
  startedTs: number;
  completedTs?: number;
  completedDurationMs?: number;
  sampleSize?: number;
  isLimitReached?: boolean;
  uniqueValuesCount?: number;
  requestedByUserId?: string;
  errorMessage?: string;
};

export let zToBackendSeedRecordsInputCachedColumnsItem = z
  .object({
    projectId: z.string(),
    connectionId: z.string(),
    envId: z.string(),
    schemaNameLc: z.string(),
    tableNameLc: z.string(),
    columnNameLc: z.string(),
    status: z.enum(['running', 'completed', 'error']),
    limit: z.number(),
    startedTs: z.number(),
    completedTs: z.number().nullish(),
    completedDurationMs: z.number().nullish(),
    sampleSize: z.number().nullish(),
    isLimitReached: z.boolean().nullish(),
    uniqueValuesCount: z.number().nullish(),
    requestedByUserId: z.string().nullish(),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsInputCachedColumnsItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputCachedColumnsItem,
  z.infer<typeof zToBackendSeedRecordsInputCachedColumnsItem>
>({ value: true });
