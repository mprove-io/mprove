import type { ModelX } from '#common/types/backend/parts/model-x';
import type { Extend } from '#common/types/extend';

export type ModelXWithTotalDashboards = Extend<
  ModelX,
  { totalDashboards: number }
>;
