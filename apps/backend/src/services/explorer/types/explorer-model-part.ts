import type { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import type { ModelTypeEnum } from '#common/enums/model-type.enum';

export type ExplorerModelPart = {
  modelId: string;
  label: string;
  type: ModelTypeEnum;
  connectionId: string;
  connectionType: ConnectionTypeEnum;
  malloySource?: {
    source?: string | null;
    filePath: string;
    fileText: string;
  };
};
