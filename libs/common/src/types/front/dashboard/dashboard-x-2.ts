import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { Extend } from '#common/types/extend';
import type { TileX2 } from '#common/types/front/tile/tile-x-2';

export type DashboardX2 = Extend<DashboardX, { tiles: TileX2[] }>;
