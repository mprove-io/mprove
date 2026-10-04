import { wrapMconfigChart } from '#blockml/functions/wrap-mconfig-chart/wrap-mconfig-chart';
import type { FilePartTileExtra } from '#blockml/types/file-part-tile-extra';
import {
  EMPTY_QUERY_ID,
  TILE_DEFAULT_PLATE_HEIGHT,
  TILE_DEFAULT_PLATE_WIDTH,
  TILE_DEFAULT_PLATE_X,
  TILE_DEFAULT_PLATE_Y,
  TRIPLE_UNDERSCORE
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string/to-boolean-from-lowercase-string';
import type { Filter } from '#common/types/blockml/parts/filter/filter';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionControl } from '#common/types/blockml/parts/fraction/fraction-control';
import type { FractionSubTypeOption } from '#common/types/blockml/parts/fraction/fraction-sub-type-option';
import type { FileFractionControl } from '#common/types/blockml/parts/internal/file-fraction-control';
import type { FilePartTile } from '#common/types/blockml/parts/internal/file-part-tile';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { FileStoreFractionType } from '#common/types/blockml/parts/internal/file-store-fraction-type';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Tile } from '#common/types/blockml/parts/tile/tile';
import { makeQueryId } from '#node-common/functions/make-query-id/make-query-id';

export function wrapTiles(item: {
  structId: string;
  projectId: string;
  envId: string;
  tiles: FilePartTile[];
  mconfigParentType: MconfigParentType;
  mconfigParentId: string;
  apiModels: Model[];
  stores: FileStore[];
  timezone: string;
}) {
  let {
    structId,
    projectId,
    apiModels,
    stores,
    tiles,
    mconfigParentType,
    mconfigParentId,
    envId,
    timezone
  } = item;

  let apiTiles: Tile[] = [];
  let mconfigs: Mconfig[] = [];
  let queries: Query[] = [];

  tiles.forEach(tile => {
    let mconfigChart = wrapMconfigChart({
      title: tile.title,
      type: tile.type,
      options: tile.options,
      isReport: false,
      rowIdsWithShowChart: undefined,
      data: tile.data
    });

    let store: FileStore;

    let apiModel = apiModels.find(m => m.modelId === tile.model);

    if (apiModel.type === 'Store') {
      store = stores.find(s => s.name === tile.model);
    }

    let queryId =
      apiModel.type === 'Store'
        ? EMPTY_QUERY_ID
        : makeQueryId({
            projectId: projectId,
            connectionId: apiModel.connectionId,
            envId: envId,
            mconfigParentType: mconfigParentType,
            mconfigParentId: mconfigParentId,
            sql: tile.sql.join('\n'),
            storeTransformedRequestString: undefined,
            store: undefined
          });

    let query: Query = {
      queryId: queryId,
      projectId: projectId,
      envId: envId,
      connectionId: apiModel.connectionId,
      connectionType: apiModel.connectionType,
      reportId: undefined,
      reportStructId: undefined,
      sql: apiModel.type === 'Store' ? undefined : tile.sql.join('\n'),
      apiMethod: undefined,
      apiUrl: undefined,
      apiBody: undefined,
      status: 'New',
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

    let mconfigId = makeId();

    let filters: Filter[] = [];

    if (apiModel.type === 'Store') {
      tile.parameters.forEach(x => {
        let storeField = store.fields.find(k => k.name === x.apply_to);

        let filter: Filter = {
          fieldId: x.apply_to,
          fractions: x.fractions.map(y => {
            let storeResultCurrentTypeFraction: FileStoreFractionType;

            if (storeField.fieldClass !== 'filter') {
              storeResultCurrentTypeFraction = store.results
                .find(r => r.result === storeField.result)
                .fraction_types.find(ft => ft.type === y.type);
            }

            let storeFractionSubType =
              storeField.fieldClass === 'filter' ? undefined : y.type;

            let storeFractionSubTypeOptions =
              storeField.fieldClass === 'filter'
                ? undefined
                : store.results
                    .find(r => r.result === storeField.result)
                    .fraction_types.map(ft => {
                      let options = [];

                      let optionOr: FractionSubTypeOption = {
                        logicGroup: 'OR',
                        typeValue: ft.type,
                        value: `OR${TRIPLE_UNDERSCORE}${ft.type}`,
                        label: ft.label
                      };
                      options.push(optionOr);

                      let optionAndNot: FractionSubTypeOption = {
                        logicGroup: 'AND_NOT',
                        value: `AND_NOT${TRIPLE_UNDERSCORE}${ft.type}`,
                        typeValue: ft.type,
                        label: ft.label
                      };
                      options.push(optionAndNot);

                      return options;
                    })
                    .flat()
                    .sort((a, b) => {
                      if (a.logicGroup === b.logicGroup) return 0;
                      return a.logicGroup === 'OR' ? -1 : 1;
                    });

            let fraction: Fraction = {
              meta:
                storeField.fieldClass === 'filter'
                  ? undefined
                  : storeResultCurrentTypeFraction?.meta,
              operator:
                storeField.fieldClass === 'filter'
                  ? undefined
                  : y.logic === 'OR'
                    ? 'Or'
                    : 'And',
              logicGroup:
                storeField.fieldClass === 'filter' ? undefined : y.logic,
              brick: undefined,
              parentBrick: undefined,
              type: 'StoreFraction',
              storeFractionSubTypeOptions: storeFractionSubTypeOptions,
              storeFractionSubType: storeFractionSubType,
              storeFractionSubTypeLabel: isDefined(storeFractionSubType)
                ? storeFractionSubTypeOptions.find(
                    k => k.typeValue === storeFractionSubType
                  ).label
                : storeFractionSubType,
              storeFractionLogicGroupWithSubType:
                storeField.fieldClass === 'filter'
                  ? undefined
                  : `${y.logic}${TRIPLE_UNDERSCORE}${y.type}`,
              controls: y.controls.map((control: FileFractionControl) => {
                let storeControl =
                  storeField.fieldClass === 'filter'
                    ? storeField.fraction_controls.find(
                        fc => fc.name === control.name
                      )
                    : storeResultCurrentTypeFraction.controls.find(
                        fc => fc.name === control.name
                      );

                let newControl: FractionControl = {
                  options: storeControl?.options,
                  value:
                    control.controlClass === 'switch' &&
                    typeof control.value === 'string'
                      ? toBooleanFromLowercaseString(control.value)
                      : control.value,
                  label: storeControl.label,
                  required: storeControl.required,
                  name: control.name,
                  controlClass: control.controlClass,
                  isMetricsDate: storeControl.isMetricsDate
                };
                return newControl;
              })
            };
            return fraction;
          })
        };
        filters.push(filter);
      });
    } else {
      Object.keys(tile.filtersFractions).forEach(fieldId => {
        filters.push({
          fieldId: fieldId,
          fractions: tile.filtersFractions[fieldId] || []
        });
      });
    }

    let mconfig: Mconfig = {
      structId: structId,
      mconfigId: mconfigId,
      queryId: queryId,
      modelId: tile.model,
      modelType: apiModel.type,
      parentType: mconfigParentType,
      parentId: mconfigParentId,
      dateRangeIncludesRightSide:
        apiModel.type === 'Store' &&
        (isUndefined(store.date_range_includes_right_side) ||
          toBooleanFromLowercaseString(store.date_range_includes_right_side) ===
            true)
          ? true
          : false,
      storePart: undefined,
      modelLabel: apiModel.label,
      modelFilePath: apiModel.filePath,
      malloyQueryStable: tile.malloyQueryStable,
      malloyQueryExtra: tile.malloyQueryExtra,
      compiledQuery: tile.compiledQuery,
      select: tile.select || [],
      sortings:
        tile.sortingsAry?.map(s => ({
          fieldId: s.fieldId,
          desc: s.desc
        })) || [],
      sorts: tile.sorts,
      timezone: timezone,
      limit: isDefined(tile.limit) ? Number(tile.limit) : 500,
      filters: filters.sort((a, b) =>
        a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
      ),
      appliedGivens: (tile as FilePartTileExtra).appliedGivens,
      chart: mconfigChart,
      serverTs: 1
    };

    mconfigs.push(mconfig);
    queries.push(query);
    apiTiles.push({
      modelId: tile.model,
      modelLabel: apiModel.label,
      modelFilePath: apiModel.filePath,
      mconfigId: mconfigId,
      queryId: queryId,
      trackChangeId: makeId(),
      listen: tile.listen,
      deletedFilterFieldIds: undefined,
      title: mconfigChart.title,
      plateWidth: isDefined(tile.plate?.plate_width)
        ? Number(tile.plate.plate_width)
        : TILE_DEFAULT_PLATE_WIDTH,
      plateHeight: isDefined(tile.plate?.plate_height)
        ? Number(tile.plate.plate_height)
        : TILE_DEFAULT_PLATE_HEIGHT,
      plateX: isDefined(tile.plate?.plate_x)
        ? Number(tile.plate.plate_x)
        : TILE_DEFAULT_PLATE_X,
      plateY: isDefined(tile.plate?.plate_y)
        ? Number(tile.plate.plate_y)
        : TILE_DEFAULT_PLATE_Y
    });
  });

  return {
    apiTiles: apiTiles,
    mconfigs: mconfigs,
    queries: queries
  };
}
