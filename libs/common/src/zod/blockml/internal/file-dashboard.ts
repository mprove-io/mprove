import { z } from 'zod';
import { zFieldAny } from '#common/zod/blockml/internal/field-any';
import { zFileBasic } from '#common/zod/blockml/internal/file-basic';
import { zFilePartTile } from '#common/zod/blockml/internal/file-part-tile';

export let zFileDashboard = zFileBasic
  .extend({
    dashboard: z.string().nullish(),
    dashboard_line_num: z.number().nullish(),
    hidden: z.string().nullish(),
    hidden_line_num: z.number().nullish(),
    title: z.string().nullish(),
    title_line_num: z.number().nullish(),
    group: z.string().nullish(),
    group_line_num: z.number().nullish(),
    access_roles: z.array(z.string()).nullish(),
    access_roles_line_num: z.number().nullish(),
    parameters: z.array(zFieldAny).nullish(),
    parameters_line_num: z.number().nullish(),
    fields: z.array(zFieldAny).nullish(),
    fields_line_num: z.number().nullish(),
    tiles: z.array(zFilePartTile).nullish(),
    tiles_line_num: z.number().nullish()
  })
  .meta({ id: 'FileDashboard' });

export type FileDashboard = z.infer<typeof zFileDashboard>;
