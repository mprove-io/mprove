import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { zModelField } from '#common/zod/blockml/model-field';
import { zModelNode } from '#common/zod/blockml/model-node';

export let zModel = z
  .object({
    structId: z.string(),
    modelId: z.string(),
    type: z.enum(ModelTypeEnum),
    source: z.string().optional(),
    connectionId: z.string(),
    connectionType: z.enum(ConnectionTypeEnum),
    filePath: z.string(),
    fileText: z.string(),
    storeContent: z.any(),
    dateRangeIncludesRightSide: z.boolean(),
    accessRoles: z.array(z.string()),
    label: z.string(),
    fields: z.array(zModelField),
    nodes: z.array(zModelNode),
    malloyModelDef: z.any(),
    serverTs: z.number().int(),
    hasAccess: z.boolean()
  })
  .meta({ id: 'Model' });

export type ZModel = z.infer<typeof zModel>;
