import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { zModelField } from '#common/zod/z-model/z-model-field';
import { zModelNode } from '#common/zod/z-model/z-model-node';

export let zModel = z.object({
  structId: z.string().nullish(),
  modelId: z.string().nullish(),
  type: z.enum(ModelTypeEnum).nullish(),
  source: z.string().nullish(),
  connectionId: z.string().nullish(),
  connectionType: z.enum(ConnectionTypeEnum).nullish(),
  filePath: z.string().nullish(),
  fileText: z.string().nullish(),
  storeContent: z.any().nullish(),
  dateRangeIncludesRightSide: z.boolean().nullish(),
  accessRoles: z.array(z.string()).nullish(),
  label: z.string().nullish(),
  fields: z.array(zModelField).nullish(),
  nodes: z.array(zModelNode).nullish(),
  malloyModelDef: z.any().nullish(),
  serverTs: z.number().nullish(),
  hasAccess: z.boolean().nullish()
});
