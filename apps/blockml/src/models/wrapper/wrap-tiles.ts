import { common } from '~blockml/barrels/common';
import { nodeCommon } from '~blockml/barrels/node-common';
import { STORE_MODEL_PREFIX } from '~common/constants/top';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { FileFractionControl } from '~common/interfaces/blockml/internal/file-fraction-control';
import { wrapMconfigChart } from './wrap-mconfig-chart';

export function wrapTiles(item: {
  structId: string;
  orgId: string;
  projectId: string;
  envId: string;
  tiles: common.FilePartTile[];
  models: common.FileModel[];
  stores: common.FileStore[];
  timezone: string;
}) {
  let { structId, orgId, projectId, models, stores, tiles, envId, timezone } =
    item;

  let apiTiles: common.Tile[] = [];
  let mconfigs: common.Mconfig[] = [];
  let queries: common.Query[] = [];

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

    let isStore = tile.model.startsWith(STORE_MODEL_PREFIX);
    let model;
    let store: common.FileStore;

    if (isStore === true) {
      store = stores.find(
        m => `${STORE_MODEL_PREFIX}_${m.name}` === tile.model
      );
    } else {
      model = models.find(m => m.name === tile.model);
    }

    let connection = isStore === false ? model.connection : store.connection;

    let queryId =
      isStore === true
        ? common.EMPTY_QUERY_ID
        : nodeCommon.makeQueryId({
            sql: tile.sql,
            storeStructId: undefined,
            storeModelId: undefined,
            storeMethod: undefined,
            storeUrlPath: undefined,
            storeBody: undefined,
            orgId: orgId,
            projectId: projectId,
            connectionId: connection.connectionId,
            envId: envId
          });

    let query: common.Query = {
      queryId: queryId,
      projectId: projectId,
      envId: envId,
      connectionId: connection.connectionId,
      connectionType: connection.type,
      storeModelId: isStore === true ? tile.model : undefined,
      storeStructId: isStore === true ? structId : undefined,
      sql: isStore === true ? undefined : tile.sql.join('\n'),
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

    if (isStore === false) {
      Object.keys(tile.filtersFractions).forEach(fieldId => {
        filters.push({
          fieldId: fieldId,
          fractions:
            (isStore === true ? [] : tile.filtersFractions[fieldId]) || []
        });
      });
    } else {
      tile.parameters.forEach(x => {
        let field = store.fields.find(k => k.name === x.apply_to);

        let filter: common.Filter = {
          fieldId: x.apply_to,
          fractions: x.fractions.map(y => {
            let storeResultCurrentTypeFraction: common.FileStoreFractionType;

            if (field.fieldClass !== common.FieldClassEnum.Filter) {
              storeResultCurrentTypeFraction = store.results
                .find(r => r.result === field.result)
                .fraction_types.find(ft => ft.type === y.type);
            }

            let fraction: common.Fraction = {
              meta:
                field.fieldClass === common.FieldClassEnum.Filter
                  ? undefined
                  : storeResultCurrentTypeFraction?.meta,
              operator:
                field.fieldClass === common.FieldClassEnum.Filter
                  ? undefined
                  : y.logic === common.FractionLogicEnum.Or
                  ? common.FractionOperatorEnum.Or
                  : common.FractionOperatorEnum.And,
              logicGroup:
                field.fieldClass === common.FieldClassEnum.Filter
                  ? undefined
                  : y.logic,
              brick: undefined,
              type: common.FractionTypeEnum.StoreFraction,
              storeFractionSubType:
                field.fieldClass === common.FieldClassEnum.Filter
                  ? undefined
                  : y.type,
              storeFractionLogicGroupWithSubType:
                field.fieldClass === common.FieldClassEnum.Filter
                  ? undefined
                  : y.logic + y.type,
              storeFractionSubTypeOptions:
                field.fieldClass === common.FieldClassEnum.Filter
                  ? undefined
                  : store.results
                      .find(r => r.result === field.result)
                      .fraction_types.map(ft => {
                        let options = [];

                        if (
                          common.isUndefined(ft.or) ||
                          toBooleanFromLowercaseString(ft.or) === true
                        ) {
                          let optionOr: FractionSubTypeOption = {
                            logicGroup: common.FractionLogicEnum.Or,
                            typeValue: ft.type,
                            value: common.FractionLogicEnum.Or + ft.type,
                            label: ft.label
                          };
                          options.push(optionOr);
                        }

                        if (
                          common.isUndefined(ft.and_not) ||
                          toBooleanFromLowercaseString(ft.and_not) === true
                        ) {
                          let optionAndNot: FractionSubTypeOption = {
                            logicGroup: common.FractionLogicEnum.AndNot,
                            value: common.FractionLogicEnum.AndNot + ft.type,
                            typeValue: ft.type,
                            label: ft.label
                          };
                          options.push(optionAndNot);
                        }

                        return options;
                      })
                      .flat()
                      .sort((a, b) => {
                        if (a.logicGroup === b.logicGroup) return 0;
                        return a.logicGroup === common.FractionLogicEnum.Or
                          ? -1
                          : 1;
                      }),
              controls: y.controls.map((control: FileFractionControl) => {
                let storeControl =
                  field.fieldClass === common.FieldClassEnum.Filter
                    ? field.fraction_controls.find(
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
                  controlClass: control.controlClass
                };
                return newControl;
              })
            };
            return fraction;
          })
        };
        filters.push(filter);
      });
    }

    let mconfig: common.Mconfig = {
      structId: structId,
      mconfigId: mconfigId,
      queryId: queryId,
      modelId: tile.model,
      isStoreModel: isStore,
      storePart: undefined,
      modelLabel: isStore === true ? store.label : model.label,
      select: tile.select,
      unsafeSelect: tile.unsafeSelect || [],
      warnSelect: tile.warnSelect || [],
      joinAggregations: tile.joinAggregations || [],
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
      modelId: tile.model,
      modelLabel: isStore === true ? store.label : model.label,
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
