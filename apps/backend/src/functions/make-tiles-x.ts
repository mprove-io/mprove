import { common } from '~backend/barrels/common';

export function makeTilesX(item: {
  tiles: common.Tile[];
  mconfigs: common.MconfigX[];
  queries: common.Query[];
  isAddMconfigAndQuery: boolean;
  models: common.ModelX[];
  dashboardExtendedFilters: common.FilterX[];
}): common.TileX[] {
  let {
    tiles,
    mconfigs,
    queries,
    isAddMconfigAndQuery,
    models,
    dashboardExtendedFilters
  } = item;

  let tilesX: common.TileX[] = tiles.map(x => {
    let tileX: common.TileX = Object.assign({}, x, <common.TileX>{
      hasAccessToModel: models.find(m => m.modelId === x.modelId).hasAccess
    });

    if (isAddMconfigAndQuery === true) {
      tileX.mconfig = mconfigs.find(m => m.mconfigId === x.mconfigId);
      tileX.query = queries.find(q => q.queryId === x.queryId);

      let listen = tileX.listen;

      if (common.isDefined(dashboardExtendedFilters)) {
        tileX.mconfig.extendedFilters = tileX.mconfig.extendedFilters.sort(
          (a, b) => {
            if (common.isDefined(listen[a.fieldId])) {
              let aIndex = dashboardExtendedFilters.findIndex(
                df => df.fieldId === listen[a.fieldId]
              );

              if (common.isDefined(listen[b.fieldId])) {
                let bIndex = dashboardExtendedFilters.findIndex(
                  df => df.fieldId === listen[b.fieldId]
                );
                return aIndex > bIndex ? 1 : bIndex > aIndex ? -1 : 0;
              } else {
                return -1;
              }
            } else if (common.isDefined(listen[b.fieldId])) {
              return 1;
            } else {
              return a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0;
            }
          }
        );
      } else {
        tileX.mconfig.extendedFilters = tileX.mconfig.extendedFilters.sort(
          (a, b) => (a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0)
        );
      }
    }

    return tileX;
  });

  return tilesX;
}
