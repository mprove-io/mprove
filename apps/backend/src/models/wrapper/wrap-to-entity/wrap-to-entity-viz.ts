import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function wrapToEntityViz(item: {
  viz: common.Viz;
  vizFullId?: string;
}): schemaPostgres.VizEnt {
  let { viz, vizFullId } = item;

  return {
    vizFullId: vizFullId || common.makeId(),
    structId: viz.structId,
    vizId: viz.vizId,
    title: viz.title,
    modelId: viz.modelId,
    modelLabel: viz.modelLabel,
    filePath: viz.filePath,
    accessUsers: viz.accessUsers,
    accessRoles: viz.accessRoles,
    gr: viz.gr,
    hidden: viz.hidden,
    tiles: viz.tiles,
    serverTs: viz.serverTs
  };
}
