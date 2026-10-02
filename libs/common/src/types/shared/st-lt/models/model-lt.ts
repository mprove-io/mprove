import type { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileStore,
  zFileStore
} from '#common/types/blockml/parts/internal/file-store';
import {
  type ModelField,
  zModelField
} from '#common/types/blockml/parts/model-field';
import {
  type ModelNode,
  zModelNode
} from '#common/types/blockml/parts/model-node';

export type ModelLt = {
  malloyModelDef: MalloyModelDef;
  fileText: string;
  storeContent: FileStore;
  dateRangeIncludesRightSide: boolean;
  fields: ModelField[];
  nodes: ModelNode[];
};

export let zModelLt = z
  .object({
    malloyModelDef: z.custom<MalloyModelDef>(),
    fileText: z.string(),
    storeContent: zFileStore,
    dateRangeIncludesRightSide: z.boolean(),
    fields: z.array(zModelField),
    nodes: z.array(zModelNode)
  })
  .meta({ id: 'ModelLt' });

assertTypesEqual<ModelLt, z.infer<typeof zModelLt>>({ value: true });
