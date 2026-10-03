import type { Tile } from '#common/types/blockml/parts/tile';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

export type ChartSt = {
  title: string;
  modelLabel: string;
  filePath: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  tiles: Tile[];
};
