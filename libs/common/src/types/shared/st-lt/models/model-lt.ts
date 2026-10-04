import type { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { ModelNode } from '#common/types/blockml/parts/model/model-node';

export type ModelLt = {
  malloyModelDef: MalloyModelDef;
  fileText: string;
  storeContent: FileStore;
  dateRangeIncludesRightSide: boolean;
  fields: ModelField[];
  nodes: ModelNode[];
};
