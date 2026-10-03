import type { FieldAny } from '#common/types/blockml/parts/internal/field-any';
import type { FileBasic } from '#common/types/blockml/parts/internal/file-basic';
import type { FilePartTile } from '#common/types/blockml/parts/internal/file-part-tile';
import type { Extend } from '#common/types/extend';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

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
