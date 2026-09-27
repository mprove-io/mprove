import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartX, zChartX } from '#common/zod/backend/chart-x';
import { type MconfigX, zMconfigX } from '#common/zod/backend/mconfig-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type BmlError, zBmlError } from '#common/zod/blockml/bml-error';
import { type Query, zQuery } from '#common/zod/blockml/query';
import {
  type ToBackendGetExplorerChartTabError,
  zToBackendGetExplorerChartTabError
} from './get-explorer-chart-tab-error';

export type ToBackendGetExplorerChartTabOutput =
  | {
      status: 'ok';
      chart: ChartX;
      mconfig: MconfigX;
      query: Query;
    }
  | {
      status: 'error';
      errors: BmlError[];
    };

export type ToBackendGetExplorerChartTabResponse = ToBackendResponse<
  ToBackendGetExplorerChartTabOutput,
  ToBackendGetExplorerChartTabError
>;

export let zToBackendGetExplorerChartTabOutput = z
  .discriminatedUnion('status', [
    z.object({
      status: z.literal('ok'),
      chart: zChartX,
      mconfig: zMconfigX,
      query: zQuery
    }),
    z.object({
      status: z.literal('error'),
      errors: z.array(zBmlError)
    })
  ])
  .meta({ id: 'ToBackendGetExplorerChartTabOutput' });

export let zToBackendGetExplorerChartTabResponse = makeToBackendResponseSchema({
  success: zToBackendGetExplorerChartTabOutput,
  error: zToBackendGetExplorerChartTabError
}).meta({ id: 'ToBackendGetExplorerChartTabResponse' });

assertTypesEqual<
  ToBackendGetExplorerChartTabOutput,
  z.infer<typeof zToBackendGetExplorerChartTabOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetExplorerChartTabResponse,
  z.infer<typeof zToBackendGetExplorerChartTabResponse>
>({ value: true });
