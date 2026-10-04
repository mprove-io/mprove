import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ReportUnit,
  zReportUnit
} from '#common/types/backend/parts/report/report-unit';
import {
  type SpaceNode,
  zSpaceNode
} from '#common/types/backend/parts/space-node';

export type ToBackendDeleteReportOutput = {
  reportUnitDrafts: ReportUnit[];
  reportSpaceNodes: SpaceNode[];
};

export let zToBackendDeleteReportOutput = z
  .object({
    reportUnitDrafts: z.array(zReportUnit),
    reportSpaceNodes: z.array(zSpaceNode)
  })
  .meta({ id: 'ToBackendDeleteReportOutput' });

assertTypesEqual<
  ToBackendDeleteReportOutput,
  z.infer<typeof zToBackendDeleteReportOutput>
>({ value: true });
