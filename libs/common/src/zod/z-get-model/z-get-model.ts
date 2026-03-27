import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { zGetModelField } from '#common/zod/z-get-model/z-get-model-field';

export let zGetModel = z.object({
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
  fields: z.array(zGetModelField),
  nodes: z.array(z.any()),
  malloyModelDef: z.any(),
  serverTs: z.number(),
  hasAccess: z.boolean()
});
