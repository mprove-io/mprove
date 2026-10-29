import type { StructTab } from '#backend/drizzle/postgres/tables/structs';
import type { ModelMetricX } from '#common/types/backend/parts/model/model-metric-x';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { StructX } from '#common/types/backend/parts/struct/struct-x';

export function structTabToApi(item: {
  struct: StructTab;
  modelPartXs: ModelPartX[];
}): StructX {
  let { struct, modelPartXs } = item;

  let apiStruct: StructX = {
    projectId: struct.projectId,
    structId: struct.structId,
    errors: struct.errors,
    modelFilePaths: struct.modelFilePaths ?? [],
    metrics: struct.metrics.map(x => {
      let modelMetricX: ModelMetricX = Object.assign({}, x, {
        hasAccessToModel: modelPartXs.find(y => y.modelId === x.modelId)
          .hasAccess
      });

      return modelMetricX;
    }),
    presets: struct.presets,
    spaces: struct.spaces,
    mproveConfig: struct.mproveConfig,
    mproveExplorer: struct.mproveExplorer,
    mproveVersion: struct.mproveVersion,
    serverTs: Number(struct.serverTs)
  };

  return apiStruct;
}
