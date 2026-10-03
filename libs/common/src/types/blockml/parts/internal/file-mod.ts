import type { Model as MalloyModel } from '@malloydata/malloy';
import type { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import type { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import type { FileBasic } from '#common/types/blockml/parts/internal/file-basic';
import type { FlatMalloyFieldItem } from '#common/types/blockml/parts/internal/flat-malloy-field-item';
import type { EnumValues } from '#common/types/enum-values';
import type { Extend } from '#common/types/extend';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

export type FileMod = Extend<
  FileBasic,
  {
    source?: string;
    label?: string;
    location?: string;
    space?: string;
    blockmlPath?: string;
    access_roles?: string[];
    accessRolesCombined?: AccessRoleCombined[];
    connectionId?: string;
    connectionType?: EnumValues<typeof ConnectionTypeEnum>;
    malloyModel?: MalloyModel;
    valueWithSourceInfo?: ModelEntryValueWithSource;
    flatMalloyFieldItems?: FlatMalloyFieldItem[];
  }
>;
