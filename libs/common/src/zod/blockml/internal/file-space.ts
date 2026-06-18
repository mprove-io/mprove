import { z } from 'zod';
import { zFileBasic } from '#common/zod/blockml/internal/file-basic';

export let zFileSpace = zFileBasic
  .extend({
    space: z.string().nullish(),
    space_line_num: z.number().nullish(),
    title: z.string().nullish(),
    title_line_num: z.number().nullish(),
    access_roles: z.array(z.string()).nullish(),
    access_roles_line_num: z.number().nullish(),
    accessRolesCombined: z.array(z.string()).nullish()
  })
  .meta({ id: 'FileSpace' });

export type FileSpace = z.infer<typeof zFileSpace>;
