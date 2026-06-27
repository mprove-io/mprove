import { z } from 'zod';

export let zFilePartSpaceShape = {
  space: z.string().nullish(),
  space_line_num: z.number().nullish(),
  title: z.string().nullish(),
  fullTitle: z.string().nullish(),
  title_line_num: z.number().nullish(),
  access_roles: z.array(z.string()).nullish(),
  access_roles_line_num: z.number().nullish(),
  accessRolesCombined: z.array(z.string()).nullish()
};
