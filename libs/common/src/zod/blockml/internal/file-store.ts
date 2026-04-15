import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { zFieldAny } from '#common/zod/blockml/internal/field-any';
import { zFileBasic } from '#common/zod/blockml/internal/file-basic';
import { zFileStoreBuildMetric } from '#common/zod/blockml/internal/file-store-build-metric';
import { zFileStoreFieldGroup } from '#common/zod/blockml/internal/file-store-field-group';
import { zFileStoreFieldTimeGroup } from '#common/zod/blockml/internal/file-store-field-time-group';
import { zFileStoreResult } from '#common/zod/blockml/internal/file-store-result';

export let zFileStore = zFileBasic
  .extend({
    store: z.string().nullish(),
    store_line_num: z.number().nullish(),
    preset: z.string().nullish(),
    preset_line_num: z.number().nullish(),
    label: z.string().nullish(),
    label_line_num: z.number().nullish(),
    access_roles: z.array(z.string()).nullish(),
    access_roles_line_num: z.number().nullish(),
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

export type FileStore = z.infer<typeof zFileStore>;
