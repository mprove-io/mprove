import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

export type ModelSt = {
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  source: string;
  filePath: string;
  space?: string;
  spaceFullTitle: string;
  label: string;
};
