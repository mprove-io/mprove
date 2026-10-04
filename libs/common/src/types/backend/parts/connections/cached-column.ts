import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CachedColumnStatus,
  zCachedColumnStatus
} from '#common/types/backend/parts/connections/cached-column-status';

export type CachedColumn = {
  projectId: string;
  connectionId: string;
  envId: string;
  schemaName: string;
  tableName: string;
  columnName: string;
  requestedByUserId?: string;
  status: CachedColumnStatus;
  errorMessage?: string;
  startedTs: number;
  completedTs?: number;
  completedDurationMs?: number;
  limit: number;
  sampleSize?: number;
  isLimitReached?: boolean;
  serverTs: number;
  uniqueValuesCount?: number;
};

export let zCachedColumn = z.object({
  projectId: z.string(),
  connectionId: z.string(),
  envId: z.string(),
  schemaName: z.string(),
  tableName: z.string(),
  columnName: z.string(),
  requestedByUserId: z.string().nullish(),
  status: zCachedColumnStatus,
  errorMessage: z.string().nullish(),
  startedTs: z.number(),
  completedTs: z.number().nullish(),
  completedDurationMs: z.number().nullish(),
  limit: z.number(),
  sampleSize: z.number().nullish(),
  isLimitReached: z.boolean().nullish(),
  serverTs: z.number(),
  uniqueValuesCount: z.number().nullish()
});

assertTypesEqual<CachedColumn, z.infer<typeof zCachedColumn>>({ value: true });
