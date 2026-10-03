import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FieldAny,
  zFieldAny
} from '#common/types/blockml/parts/internal/field-any';
import {
  type FileBasic,
  zFileBasic
} from '#common/types/blockml/parts/internal/file-basic';
import {
  type FilePartTile,
  zFilePartTile
} from '#common/types/blockml/parts/internal/file-part-tile';
import type { Extend } from '#common/types/extend';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type FileDashboard = Extend<
  FileBasic,
  {
    dashboard?: string;
    dashboard_line_num?: number;
    hidden?: string;
    hidden_line_num?: number;
    title?: string;
    title_line_num?: number;
    space?: string;
    group?: string;
    group_line_num?: number;
    access_roles?: string[];
    access_roles_line_num?: number;
    accessRolesCombined?: AccessRoleCombined[];
    parameters?: FieldAny[];
    parameters_line_num?: number;
    fields?: FieldAny[];
    fields_line_num?: number;
    tiles?: FilePartTile[];
    tiles_line_num?: number;
  }
>;

export let zFileDashboard = zFileBasic
  .extend({
    dashboard: z.string().nullish(),
    dashboard_line_num: z.number().nullish(),
    hidden: z.string().nullish(),
    hidden_line_num: z.number().nullish(),
    title: z.string().nullish(),
    title_line_num: z.number().nullish(),
    space: z.string().nullish(),
    group: z.string().nullish(),
    group_line_num: z.number().nullish(),
    access_roles: z.array(z.string()).nullish(),
    access_roles_line_num: z.number().nullish(),
    accessRolesCombined: z.array(zAccessRoleCombined).nullish(),
    parameters: z.array(zFieldAny).nullish(),
    parameters_line_num: z.number().nullish(),
    fields: z.array(zFieldAny).nullish(),
    fields_line_num: z.number().nullish(),
    tiles: z.array(zFilePartTile).nullish(),
    tiles_line_num: z.number().nullish()
  })
  .meta({ id: 'FileDashboard' });

assertTypesEqual<FileDashboard, z.infer<typeof zFileDashboard>>({
  value: true
});
