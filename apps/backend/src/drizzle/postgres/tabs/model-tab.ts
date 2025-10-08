import { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { ModelNode } from '~common/interfaces/blockml/model-node';
import { ModelEnt } from '../schema/models';

export interface ModelTab
  extends Omit<ModelEnt, 'st' | 'lt'>,
    ModelSt,
    ModelLt {}

export class ModelSt {
  accessRoles: string[];
}

export class ModelLt {
  source: string;
  malloyModelDef: MalloyModelDef;
  filePath: string;
  fileText: string;
  storeContent: FileStore;
  dateRangeIncludesRightSide: boolean;
  label: string;
  fields: ModelField[];
  nodes: ModelNode[];
}
