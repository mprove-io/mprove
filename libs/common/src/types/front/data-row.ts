import type { Row } from '#common/types/blockml/parts/row';
import type { Extend } from '#common/types/extend';

export type DataRow = Extend<
  Row,
  { showMetricsParameters: boolean; finalRowHeight: number }
>;
