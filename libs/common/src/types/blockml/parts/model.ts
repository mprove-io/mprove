import type { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import {
  type ModelField,
  zModelField
} from '#common/types/blockml/parts/model-field';
import {
  type ModelNode,
  zModelNode
} from '#common/types/blockml/parts/model-node';
import type { EnumValues } from '#common/types/enum-values';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type Model = {
  structId: string;
  modelId: string;
  type: EnumValues<typeof ModelTypeEnum>;
  source?: string;
  connectionId: string;
  connectionType: EnumValues<typeof ConnectionTypeEnum>;
  filePath: string;
  space?: string;
  spaceFullTitle: string;
  fileText: string;
  storeContent: FileStore;
  dateRangeIncludesRightSide: boolean;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  label: string;
  fields: ModelField[];
  nodes: ModelNode[];
  malloyModelDef: MalloyModelDef;
  serverTs: number;
  hasAccess?: boolean;
};

export let zModel = z
  .object({
    structId: z.string(),
    modelId: z.string(),
    type: z.enum(ModelTypeEnum),
    source: z.string().nullish(),
    connectionId: z.string(),
    connectionType: z.enum(ConnectionTypeEnum),
    filePath: z.string(),
    space: z.string().nullish(),
    spaceFullTitle: z.string(),
    fileText: z.string(),
    storeContent: z.custom<FileStore>(),
    dateRangeIncludesRightSide: z.boolean(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    label: z.string(),
    fields: z.array(zModelField),
    nodes: z.array(zModelNode),
    malloyModelDef: z.custom<MalloyModelDef>(),
    serverTs: z.number().int(),
    hasAccess: z.boolean().nullish()
  })
  .meta({ id: 'Model' });

assertTypesEqual<Model, z.infer<typeof zModel>>({ value: true });
