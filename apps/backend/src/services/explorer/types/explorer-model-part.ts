import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import type { ModelType } from '#common/types/blockml/parts/model/model-type';

export type ExplorerModelPart = {
  modelId: string;
  label: string;
  type: ModelType;
  connectionId: string;
  connectionType: ConnectionType;
  malloySource?: {
    source?: string | null;
    filePath: string;
    fileText: string;
  };
};
