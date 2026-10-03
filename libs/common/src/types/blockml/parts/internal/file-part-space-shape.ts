import { z } from 'zod';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

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

export let zFilePartSpaceShape = {
  space: z.string().nullish(),
  space_line_num: z.number().nullish(),
  title: z.string().nullish(),
  fullTitle: z.string().nullish(),
  title_line_num: z.number().nullish(),
  access_roles: z.array(z.string()).nullish(),
  access_roles_line_num: z.number().nullish(),
  accessRolesCombined: z.array(zAccessRoleCombined).nullish()
};
