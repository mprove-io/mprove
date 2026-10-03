import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
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
  type FileStoreBuildMetric,
  zFileStoreBuildMetric
} from '#common/types/blockml/parts/internal/file-store-build-metric';
import {
  type FileStoreFieldGroup,
  zFileStoreFieldGroup
} from '#common/types/blockml/parts/internal/file-store-field-group';
import {
  type FileStoreFieldTimeGroup,
  zFileStoreFieldTimeGroup
} from '#common/types/blockml/parts/internal/file-store-field-time-group';
import {
  type FileStoreResult,
  zFileStoreResult
} from '#common/types/blockml/parts/internal/file-store-result';
import type { EnumValues } from '#common/types/enum-values';
import type { Extend } from '#common/types/extend';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

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
    connectionType?: EnumValues<typeof ConnectionTypeEnum>;
    fieldsDeps?: Record<string, Record<string, number>>;
    fieldsDepsAfterSingles?: Record<string, Record<string, number>>;
  }
>;

export let zFileStore = zFileBasic
  .extend({
    store: z.string().nullish(),
    store_line_num: z.number().nullish(),
    preset: z.string().nullish(),
    preset_line_num: z.number().nullish(),
    label: z.string().nullish(),
    label_line_num: z.number().nullish(),
    space: z.string().nullish(),
    space_line_num: z.number().nullish(),
    access_roles: z.array(z.string()).nullish(),
    access_roles_line_num: z.number().nullish(),
    accessRolesCombined: z.array(zAccessRoleCombined).nullish(),
    method: z.string().nullish(),
    method_line_num: z.number().nullish(),
    request: z.string().nullish(),
    request_line_num: z.number().nullish(),
    response: z.string().nullish(),
    response_line_num: z.number().nullish(),
    date_range_includes_right_side: z.string().nullish(),
    date_range_includes_right_side_line_num: z.number().nullish(),
    parameters: z.array(zFieldAny).nullish(),
    parameters_line_num: z.number().nullish(),
    results: z.array(zFileStoreResult).nullish(),
    results_line_num: z.number().nullish(),
    build_metrics: z.array(zFileStoreBuildMetric).nullish(),
    build_metrics_line_num: z.number().nullish(),
    field_groups: z.array(zFileStoreFieldGroup).nullish(),
    field_groups_line_num: z.number().nullish(),
    field_time_groups: z.array(zFileStoreFieldTimeGroup).nullish(),
    field_time_groups_line_num: z.number().nullish(),
    fields: z.array(zFieldAny).nullish(),
    fields_line_num: z.number().nullish(),
    connectionId: z.string().nullish(),
    connectionType: z.enum(ConnectionTypeEnum).nullish(),
    fieldsDeps: z
      .record(z.string(), z.record(z.string(), z.number()))
      .nullish(),
    fieldsDepsAfterSingles: z
      .record(z.string(), z.record(z.string(), z.number()))
      .nullish()
  })
  .meta({ id: 'FileStore' });

assertTypesEqual<FileStore, z.infer<typeof zFileStore>>({ value: true });
