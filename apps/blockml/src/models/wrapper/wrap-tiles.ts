import { common } from '~blockml/barrels/common';
import { nodeCommon } from '~blockml/barrels/node-common';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { FileFractionControl } from '~common/interfaces/blockml/internal/file-fraction-control';
import { wrapMconfigChart } from './wrap-mconfig-chart';

export function wrapTiles(item: {
  structId: string;
  projectId: string;
  envId: string;
  tiles: common.FilePartTile[];
  apiModels: common.Model[];
  mods: common.FileMod[];
  stores: common.FileStore[];
  timezone: string;
}) {
  let { structId, projectId, apiModels, stores, mods, tiles, envId, timezone } =
    item;

  let apiTiles: common.Tile[] = [];
  let mconfigs: common.Mconfig[] = [];
  let queries: common.Query[] = [];

  // console.log('item');
  // console.log(item);

  tiles.forEach(tile => {
    let mconfigChart = wrapMconfigChart({
      title: tile.title,
      description: tile.description,
      type: tile.type,
      options: tile.options,
      isReport: false,
      rowIdsWithShowChart: undefined,
      data: tile.data
    });

    let mod: common.FileMod;
    let store: common.FileStore;

    let apiModel = apiModels.find(m => m.modelId === tile.model);

    if (apiModel.type === common.ModelTypeEnum.Store) {
      store = stores.find(s => s.name === tile.model);
    } else if (apiModel.type === common.ModelTypeEnum.Malloy) {
      mod = mods.find(m => m.name === tile.model);
    }

    let connection = common.isDefined(store)
      ? store.connection
      : common.isDefined(mod)
        ? mod.connection
        : undefined;

    let queryId =
      apiModel.type === common.ModelTypeEnum.Store
        ? common.EMPTY_QUERY_ID
        : nodeCommon.makeQueryId({
            projectId: projectId,
            connectionId: connection.connectionId,
            envId: envId,
            sql: tile.sql.join('\n'),
            store: undefined, // isStore false
            storeTransformedRequestString: undefined // isStore false
          });

    let query: common.Query = {
      queryId: queryId,
      projectId: projectId,
      envId: envId,
      connectionId: connection.connectionId,
      connectionType: connection.type,
      sql:
        apiModel.type === common.ModelTypeEnum.Store
          ? undefined
          : tile.sql.join('\n'),
      apiMethod: undefined,
      apiUrl: undefined,
      apiBody: undefined,
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

    if (apiModel.type === common.ModelTypeEnum.Store) {
      tile.parameters.forEach(x => {
        let storeField = store.fields.find(k => k.name === x.apply_to);

        let filter: common.Filter = {
          fieldId: x.apply_to,
          fractions: x.fractions.map(y => {
            let storeResultCurrentTypeFraction: common.FileStoreFractionType;

            if (storeField.fieldClass !== common.FieldClassEnum.Filter) {
              storeResultCurrentTypeFraction = store.results
                .find(r => r.result === storeField.result)
                .fraction_types.find(ft => ft.type === y.type);
            }

            let storeFractionSubType =
              storeField.fieldClass === common.FieldClassEnum.Filter
                ? undefined
                : y.type;

            let storeFractionSubTypeOptions =
              storeField.fieldClass === common.FieldClassEnum.Filter
                ? undefined
                : store.results
                    .find(r => r.result === storeField.result)
                    .fraction_types.map(ft => {
                      let options = [];

                      let optionOr: FractionSubTypeOption = {
                        logicGroup: common.FractionLogicEnum.Or,
                        typeValue: ft.type,
                        value: `${common.FractionLogicEnum.Or}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                        label: ft.label
                      };
                      options.push(optionOr);

                      let optionAndNot: FractionSubTypeOption = {
                        logicGroup: common.FractionLogicEnum.AndNot,
                        value: `${common.FractionLogicEnum.AndNot}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                        typeValue: ft.type,
                        label: ft.label
                      };
                      options.push(optionAndNot);

                      return options;
                    })
                    .flat()
                    .sort((a, b) => {
                      if (a.logicGroup === b.logicGroup) return 0;
                      return a.logicGroup === common.FractionLogicEnum.Or
                        ? -1
                        : 1;
                    });

            let fraction: common.Fraction = {
              meta:
                storeField.fieldClass === common.FieldClassEnum.Filter
                  ? undefined
                  : storeResultCurrentTypeFraction?.meta,
              operator:
                storeField.fieldClass === common.FieldClassEnum.Filter
                  ? undefined
                  : y.logic === common.FractionLogicEnum.Or
                    ? common.FractionOperatorEnum.Or
                    : common.FractionOperatorEnum.And,
              logicGroup:
                storeField.fieldClass === common.FieldClassEnum.Filter
                  ? undefined
                  : y.logic,
              brick: undefined,
              type: common.FractionTypeEnum.StoreFraction,
              storeFractionSubTypeOptions: storeFractionSubTypeOptions,
              storeFractionSubType: storeFractionSubType,
              storeFractionSubTypeLabel: common.isDefined(storeFractionSubType)
                ? storeFractionSubTypeOptions.find(
                    k => k.typeValue === storeFractionSubType
                  ).label
                : storeFractionSubType,
              storeFractionLogicGroupWithSubType:
                storeField.fieldClass === common.FieldClassEnum.Filter
                  ? undefined
                  : `${y.logic}${common.TRIPLE_UNDERSCORE}${y.type}`,
              controls: y.controls.map((control: FileFractionControl) => {
                let storeControl =
                  storeField.fieldClass === common.FieldClassEnum.Filter
                    ? storeField.fraction_controls.find(
                        fc => fc.name === control.name
                      )
                    : storeResultCurrentTypeFraction.controls.find(
                        fc => fc.name === control.name
                      );

                let newControl: common.FractionControl = {
                  options: storeControl?.options,
                  value:
                    control.controlClass === common.ControlClassEnum.Switch &&
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

    let mconfig: common.Mconfig = {
      structId: structId,
      mconfigId: mconfigId,
      queryId: queryId,
      modelId: tile.model,
      modelType: common.isDefined(store)
        ? common.ModelTypeEnum.Store
        : common.isDefined(mod)
          ? common.ModelTypeEnum.Malloy
          : undefined,
      dateRangeIncludesRightSide:
        apiModel.type === common.ModelTypeEnum.Store &&
        (common.isUndefined(store.date_range_includes_right_side) ||
          common.toBooleanFromLowercaseString(
            store.date_range_includes_right_side
          ) === true)
          ? true
          : false,
      storePart: undefined,
      modelLabel: store?.label || mod?.label,
      modelFilePath: store?.filePath || mod?.filePath,
      malloyQuery: tile.malloyQuery,
      compiledQuery: tile.compiledQuery,
      select: tile.select || [],
      // unsafeSelect: tile.unsafeSelect || [],
      // warnSelect: tile.warnSelect || [],
      // joinAggregations: tile.joinAggregations || [],
      sortings:
        tile.sortingsAry?.map(s => ({
          fieldId: s.fieldId,
          desc: s.desc
        })) || [],
      sorts: tile.sorts,
      timezone: timezone,
      limit: common.isDefined(tile.limit) ? Number(tile.limit) : 500,
      filters: filters.sort((a, b) =>
        a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
      ),
      chart: mconfigChart,
      temp: false,
      serverTs: 1
    };

    // console.log('mconfig');
    // console.log(mconfig);

    mconfigs.push(mconfig);
    queries.push(query);
    apiTiles.push({
      modelId: tile.model,
      modelLabel: store?.label || mod?.label,
      // modelLabel: isStore === true ? store.label : model.label,
      modelFilePath: store?.filePath || mod?.filePath,
      mconfigId: mconfigId,
      queryId: queryId,
      // malloyQueryId: tile.query,
      listen: tile.listen,
      deletedFilterFieldIds: undefined,
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
