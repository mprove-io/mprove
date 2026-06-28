import { z } from 'zod';
import { zAccessRoleCombined } from '#common/zod/access-role-combined';
import { zFileBasic } from '#common/zod/blockml/internal/file-basic';
import { zFilePartTile } from '#common/zod/blockml/internal/file-part-tile';

export let zFileChart = zFileBasic
  .extend({
    chart: z.string().nullish(),
    chart_line_num: z.number().nullish(),
    hidden: z.string().nullish(),
    hidden_line_num: z.number().nullish(),
    space: z.string().nullish(),
    group: z.string().nullish(),
    group_line_num: z.number().nullish(),
    access_roles: z.array(z.string()).nullish(),
    access_roles_line_num: z.number().nullish(),
    accessRolesCombined: z.array(zAccessRoleCombined).nullish(),
    tiles: z.array(zFilePartTile).nullish(),
    tiles_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChart' });

export type FileChart = z.infer<typeof zFileChart>;
