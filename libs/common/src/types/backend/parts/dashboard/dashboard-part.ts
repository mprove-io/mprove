import type { Tile } from '#common/types/blockml/parts/tile/tile';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

export type DashboardPart = {
  structId: string;
  dashboardId: string;
  draft: boolean;
  creatorId: string;
  title: string;
  filePath: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  tiles: Tile[];
  author?: string;
  canEditOrDeleteDashboard: boolean;
};
