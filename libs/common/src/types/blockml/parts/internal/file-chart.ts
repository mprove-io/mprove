import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
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

export type FileChart = Extend<
  FileBasic,
  {
    chart?: string;
    chart_line_num?: number;
    hidden?: string;
    hidden_line_num?: number;
    space?: string;
    group?: string;
    group_line_num?: number;
    access_roles?: string[];
    access_roles_line_num?: number;
    accessRolesCombined?: AccessRoleCombined[];
    tiles?: FilePartTile[];
    tiles_line_num?: number;
  }
>;

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

assertTypesEqual<FileChart, z.infer<typeof zFileChart>>({ value: true });
