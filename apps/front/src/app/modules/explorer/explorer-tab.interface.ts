import type { ChartX } from '#common/types/backend/parts/chart/chart-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { BmlError } from '#common/types/blockml/diagnostics/bml-error';
import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';
import type { Query } from '#common/types/blockml/parts/query/query';

export interface ExplorerTab {
  id: string;
  label: string;
  closable?: boolean;
  kind?: string;
  chartType?: ChartType;
  chartId?: string;
  modelId?: string;
}

export type ExplorerTabContent =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; errors: BmlError[] }
  | { status: 'ready'; chart: ChartX; mconfig: MconfigX; query: Query };
