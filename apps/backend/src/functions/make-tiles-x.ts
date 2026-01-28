import { isDefined } from '#common/functions/is-defined';
import { makeId } from '#common/functions/make-id';
import { FilterX } from '#common/interfaces/backend/filter-x';
import { MconfigX } from '#common/interfaces/backend/mconfig-x';
import { ModelX } from '#common/interfaces/backend/model-x';
import { TileX } from '#common/interfaces/backend/tile-x';
import { Query } from '#common/interfaces/blockml/query';
import { Tile } from '#common/interfaces/blockml/tile';

export function makeTilesX(item: {
  tiles: Tile[];
  mconfigs: MconfigX[];
  queries: Query[];
  isAddMconfigAndQuery: boolean;
  models: ModelX[];
  dashboardExtendedFilters: FilterX[];
}): TileX[] {
  let {
    tiles,
    mconfigs,
    queries,
    isAddMconfigAndQuery,
    models,
    dashboardExtendedFilters
  } = item;

  let tilesX: TileX[] = tiles.map(x => {
    let tileX: TileX = Object.assign({}, x, <TileX>{
      hasAccessToModel: models.find(m => m.modelId === x.modelId).hasAccess
    });

    if (isAddMconfigAndQuery === true) {
      tileX.mconfig = mconfigs.find(m => m.mconfigId === x.mconfigId);
      tileX.query = queries.find(q => q.queryId === x.queryId);
      tileX.trackChangeId = makeId();

      let listen = tileX.listen;

      if (isDefined(dashboardExtendedFilters)) {
        tileX.mconfig.extendedFilters = tileX.mconfig.extendedFilters.sort(
          (a, b) => {
            if (isDefined(listen[a.fieldId])) {
              let aIndex = dashboardExtendedFilters.findIndex(
                df => df.fieldId === listen[a.fieldId]
              );

              if (isDefined(listen[b.fieldId])) {
                let bIndex = dashboardExtendedFilters.findIndex(
                  df => df.fieldId === listen[b.fieldId]
                );
                return aIndex > bIndex ? 1 : bIndex > aIndex ? -1 : 0;
              } else {
                return -1;
              }
            } else if (isDefined(listen[b.fieldId])) {
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
