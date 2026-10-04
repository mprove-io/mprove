import type { FileBasic } from '#common/types/blockml/parts/internal/file/file-basic';
import type { FilePartTile } from '#common/types/blockml/parts/internal/file-part-tile';
import type { Extend } from '#common/types/extend';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

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
