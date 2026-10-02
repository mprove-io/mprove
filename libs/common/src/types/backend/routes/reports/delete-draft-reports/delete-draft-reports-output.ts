import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ReportUnit,
  zReportUnit
} from '#common/types/backend/report-unit';

export type ToBackendDeleteDraftReportsOutput = {
  reportUnitDrafts: ReportUnit[];
};

export let zToBackendDeleteDraftReportsOutput = z
  .object({
    reportUnitDrafts: z.array(zReportUnit)
  })
  .meta({ id: 'ToBackendDeleteDraftReportsOutput' });

assertTypesEqual<
  ToBackendDeleteDraftReportsOutput,
  z.infer<typeof zToBackendDeleteDraftReportsOutput>
>({ value: true });
