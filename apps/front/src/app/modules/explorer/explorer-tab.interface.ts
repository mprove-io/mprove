import type { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import type { ChartX } from '#common/types/backend/parts/chart-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig-x';
import type { BmlError } from '#common/types/blockml/parts/bml-error';
import type { Query } from '#common/types/blockml/parts/query';

export interface ExplorerTab {
  id: string;
  label: string;
  closable?: boolean;
  kind?: string;
  chartType?: ChartTypeEnum;
  chartId?: string;
  modelId?: string;
}

export type ExplorerTabContent =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; errors: BmlError[] }
  | { status: 'ready'; chart: ChartX; mconfig: MconfigX; query: Query };
