import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CachedColumnStatus,
  zCachedColumnStatus
} from '#common/types/backend/parts/connections/cached-column-status';

export type ToBackendSeedRecordsInputCachedColumnsItem = {
  projectId: string;
  connectionId: string;
  envId: string;
  schemaNameLc: string;
  tableNameLc: string;
  columnNameLc: string;
  status: CachedColumnStatus;
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
    status: zCachedColumnStatus,
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
