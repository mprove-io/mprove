import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

export type FilePartSpaceFields = {
  space?: string;
  space_line_num?: number;
  title?: string;
  fullTitle?: string;
  title_line_num?: number;
  access_roles?: string[];
  access_roles_line_num?: number;
  accessRolesCombined?: AccessRoleCombined[];
};
