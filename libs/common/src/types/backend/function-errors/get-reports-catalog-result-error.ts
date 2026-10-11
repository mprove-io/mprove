import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ReportEntToTabResultError,
  zReportEntToTabResultError
} from '#common/types/backend/function-errors/report-ent-to-tab-result-error';

export type GetReportsCatalogResultError = ReportEntToTabResultError;

export let zGetReportsCatalogResultError = zReportEntToTabResultError;

assertTypesEqual<
  GetReportsCatalogResultError,
  z.infer<typeof zGetReportsCatalogResultError>
>({ value: true });
