import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RunQuery,
  zRunQuery
} from '#common/types/backend/parts/run/run-query';

export type RunReportRow = { title: string; query: RunQuery };

export let zRunReportRow = z
  .object({
    title: z.string(),
    query: zRunQuery
  })
  .meta({ id: 'RunReportRow' });

assertTypesEqual<RunReportRow, z.infer<typeof zRunReportRow>>({ value: true });
