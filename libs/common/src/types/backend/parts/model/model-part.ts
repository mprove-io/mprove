import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

export type ModelPart = {
  structId: string;
  modelId: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
};
