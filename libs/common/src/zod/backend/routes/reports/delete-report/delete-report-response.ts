import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ReportUnit, zReportUnit } from '#common/zod/backend/report-unit';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SpaceNode, zSpaceNode } from '#common/zod/backend/space-node';
import {
  type ToBackendDeleteReportError,
  zToBackendDeleteReportError
} from './delete-report-error';

export type ToBackendDeleteReportOutput = {
  reportUnitDrafts: ReportUnit[];
  reportSpaceNodes: SpaceNode[];
};

export type ToBackendDeleteReportResponse = ToBackendResponse<
  ToBackendDeleteReportOutput,
  ToBackendDeleteReportError
>;

export let zToBackendDeleteReportOutput = z
  .object({
    reportUnitDrafts: z.array(zReportUnit),
    reportSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendDeleteReportOutput' });

export let zToBackendDeleteReportResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteReportOutput,
  error: zToBackendDeleteReportError
}).meta({ id: 'ToBackendDeleteReportResponse' });

assertTypesEqual<
  ToBackendDeleteReportOutput,
  z.infer<typeof zToBackendDeleteReportOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteReportResponse,
  z.infer<typeof zToBackendDeleteReportResponse>
>({ value: true });
