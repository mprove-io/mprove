import type { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { zAccessRoleCombined } from '#common/types/access-role-combined';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import { zModelField } from '#common/types/blockml/parts/model-field';
import { zModelNode } from '#common/types/blockml/parts/model-node';

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

export type Model = z.infer<typeof zModel>;
