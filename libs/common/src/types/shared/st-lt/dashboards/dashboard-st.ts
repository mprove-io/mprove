import type { DashboardField } from '#common/types/blockml/parts/dashboard/dashboard-field';
import type { Tile } from '#common/types/blockml/parts/tile/tile';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

export type DashboardSt = {
  title: string;
  filePath: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  tiles: Tile[];
  fields: DashboardField[];
};
