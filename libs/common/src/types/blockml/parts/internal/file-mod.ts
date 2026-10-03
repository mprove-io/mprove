import type { Model as MalloyModel } from '@malloydata/malloy';
import type { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileBasic,
  zFileBasic
} from '#common/types/blockml/parts/internal/file-basic';
import type { FlatMalloyFieldItem } from '#common/types/blockml/parts/internal/flat-malloy-field-item';
import type { EnumValues } from '#common/types/enum-values';
import type { Extend } from '#common/types/extend';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

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

assertTypesEqual<FileMod, z.infer<typeof zFileMod>>({ value: true });
