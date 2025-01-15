import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { wrapMconfigChart } from './wrap-mconfig-chart';

export function wrapTiles(item: {
  structId: string;
  orgId: string;
  projectId: string;
  envId: string;
  tiles: common.FilePartTile[];
  models: common.FileModel[];
  timezone: string;
}) {
  let { structId, orgId, projectId, models, tiles, envId, timezone } = item;

  let apiTiles: common.Tile[] = [];
  let mconfigs: common.Mconfig[] = [];
  let queries: common.Query[] = [];

  tiles.forEach(tile => {
    let mconfigChart = wrapMconfigChart({
      title: tile.title,
      description: tile.description,
      type: tile.type,
      data: tile.data,
      options: tile.options
    });

    let model = models.find(m => m.name === tile.model);

    let queryId = helper.makeQueryId({
      sql: tile.sql,
      orgId: orgId,
      projectId: projectId,
      connection: model.connection,
      envId: envId
    });

    let query: common.Query = {
      queryId: queryId,
      projectId: projectId,
      envId: envId,
      connectionId: model.connection.connectionId,
      connectionType: model.connection.type,
      sql: tile.sql.join('\n'),
      status: common.QueryStatusEnum.New,
      lastRunBy: undefined,
      lastRunTs: undefined,
      lastCancelTs: undefined,
      lastCompleteTs: undefined,
      lastCompleteDuration: undefined,
      lastErrorMessage: undefined,
      lastErrorTs: undefined,
      data: undefined,
      queryJobId: undefined,
      bigqueryQueryJobId: undefined,
      bigqueryConsecutiveErrorsGetJob: 0,
      bigqueryConsecutiveErrorsGetResults: 0,
      serverTs: 1
    };

    let mconfigId = common.makeId();

    let filters: common.Filter[] = [];

    Object.keys(tile.filtersFractions).forEach(fieldId => {
      filters.push({
        fieldId: fieldId,
        fractions: tile.filtersFractions[fieldId] || []
      });
    });

    let mconfig: common.Mconfig = {
      structId: structId,
      mconfigId: mconfigId,
      queryId: queryId,
      modelId: tile.model,
      modelLabel: model.label,
      select: tile.select,
      unsafeSelect: tile.unsafeSelect,
      warnSelect: tile.warnSelect,
      joinAggregations: tile.joinAggregations,
      sortings: tile.sortingsAry.map(s => ({
        fieldId: s.fieldId,
        desc: s.desc
      })),
      sorts: tile.sorts,
      timezone: timezone,
      limit: tile.limit ? Number(tile.limit) : undefined,
      filters: filters.sort((a, b) =>
        a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
      ),
      chart: mconfigChart,
      temp: false,
      serverTs: 1
    };

    mconfigs.push(mconfig);
    queries.push(query);
    apiTiles.push({
      modelId: model.name,
      modelLabel: model.label,
      mconfigId: mconfigId,
      queryId: queryId,
      listen: tile.listen,
      title: mconfigChart.title,
      plateWidth: common.isDefined(tile.plate?.plate_width)
        ? Number(tile.plate.plate_width)
        : common.TILE_DEFAULT_PLATE_WIDTH,
      plateHeight: common.isDefined(tile.plate?.plate_height)
        ? Number(tile.plate.plate_height)
        : common.TILE_DEFAULT_PLATE_HEIGHT,
      plateX: common.isDefined(tile.plate?.plate_x)
        ? Number(tile.plate.plate_x)
        : common.TILE_DEFAULT_PLATE_X,
      plateY: common.isDefined(tile.plate?.plate_y)
        ? Number(tile.plate.plate_y)
        : common.TILE_DEFAULT_PLATE_Y
    });
  });

  return {
    apiTiles: apiTiles,
    mconfigs: mconfigs,
    queries: queries
  };
}
