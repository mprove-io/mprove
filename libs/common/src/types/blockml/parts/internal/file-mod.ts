import type { Model as MalloyModel } from '@malloydata/malloy';
import type { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { zFileBasic } from '#common/types/blockml/parts/internal/file-basic';
import type { FlatMalloyFieldItem } from '#common/types/blockml/parts/internal/flat-malloy-field-item';
import { zAccessRoleCombined } from '#common/types/shared/access-role-combined';

export let zFileMod = zFileBasic
  .extend({
    source: z.string().nullish(),
    label: z.string().nullish(),
    location: z.string().nullish(),
    space: z.string().nullish(),
    blockmlPath: z.string().nullish(),
    access_roles: z.array(z.string()).nullish(),
    accessRolesCombined: z.array(zAccessRoleCombined).nullish(),
    connectionId: z.string().nullish(),
    connectionType: z.enum(ConnectionTypeEnum).nullish(),
    malloyModel: z.custom<MalloyModel>().nullish(),
    valueWithSourceInfo: z.custom<ModelEntryValueWithSource>().nullish(),
    flatMalloyFieldItems: z.custom<FlatMalloyFieldItem[]>().nullish()
  })
  .meta({ id: 'FileMod' });

export type FileMod = z.infer<typeof zFileMod>;
