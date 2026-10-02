import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ChartX, zChartX } from '#common/types/backend/parts/chart-x';
import {
  type MconfigX,
  zMconfigX
} from '#common/types/backend/parts/mconfig-x';
import {
  type BmlError,
  zBmlError
} from '#common/types/blockml/parts/bml-error';
import { type Query, zQuery } from '#common/types/blockml/parts/query';

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

assertTypesEqual<
  ToBackendGetExplorerChartTabOutput,
  z.infer<typeof zToBackendGetExplorerChartTabOutput>
>({ value: true });
