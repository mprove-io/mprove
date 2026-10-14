import type { ExplorerModelPart } from '#backend/services/explorer/types/explorer-model-part';
import type { ModelX } from '#common/types/backend/parts/model/model-x';

export type ExplorerModel = ExplorerModelPart & {
  fields: ModelX['fields'];
};

export type GetExplorerModelsOutput = {
  structId: string;
  models: ExplorerModel[];
};
