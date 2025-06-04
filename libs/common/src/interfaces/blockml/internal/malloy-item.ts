import { ModelInfo } from '@malloydata/malloy-interfaces';
import { Model, ModelDef, ModelMaterializer } from '@malloydata/malloy/index';

export interface MalloyItem {
  connectionId: string;
  location: string;
  malloyModel: Model;
  malloyModelMaterializer: ModelMaterializer;
  malloyModelDef: ModelDef;
  malloyModelInfo: ModelInfo;
}
