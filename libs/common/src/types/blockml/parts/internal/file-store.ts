import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';

import type { FieldAny } from '#common/types/blockml/parts/internal/field-any';
import type { FileBasic } from '#common/types/blockml/parts/internal/file/file-basic';
import type { FileStoreBuildMetric } from '#common/types/blockml/parts/internal/file-store-build-metric';
import type { FileStoreFieldGroup } from '#common/types/blockml/parts/internal/file-store-field-group';
import type { FileStoreFieldTimeGroup } from '#common/types/blockml/parts/internal/file-store-field-time-group';
import type { FileStoreResult } from '#common/types/blockml/parts/internal/file-store-result';

import type { Extend } from '#common/types/extend';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

export type FileStore = Extend<
  FileBasic,
  {
    store?: string;
    store_line_num?: number;
    preset?: string;
    preset_line_num?: number;
    label?: string;
    label_line_num?: number;
    space?: string;
    space_line_num?: number;
    access_roles?: string[];
    access_roles_line_num?: number;
    accessRolesCombined?: AccessRoleCombined[];
    method?: string;
    method_line_num?: number;
    request?: string;
    request_line_num?: number;
    response?: string;
    response_line_num?: number;
    date_range_includes_right_side?: string;
    date_range_includes_right_side_line_num?: number;
    parameters?: FieldAny[];
    parameters_line_num?: number;
    results?: FileStoreResult[];
    results_line_num?: number;
    build_metrics?: FileStoreBuildMetric[];
    build_metrics_line_num?: number;
    field_groups?: FileStoreFieldGroup[];
    field_groups_line_num?: number;
    field_time_groups?: FileStoreFieldTimeGroup[];
    field_time_groups_line_num?: number;
    fields?: FieldAny[];
    fields_line_num?: number;
    connectionId?: string;
    connectionType?: ConnectionType;
    fieldsDeps?: Record<string, Record<string, number>>;
    fieldsDepsAfterSingles?: Record<string, Record<string, number>>;
  }
>;
