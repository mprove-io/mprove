import {
  EMPTY_QUERY_ID,
  TILE_DEFAULT_PLATE_HEIGHT,
  TILE_DEFAULT_PLATE_WIDTH,
  TILE_DEFAULT_PLATE_X,
  TILE_DEFAULT_PLATE_Y,
  TRIPLE_UNDERSCORE
} from '~common/constants/top';
import { ControlClassEnum } from '~common/enums/control-class.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { MconfigParentTypeEnum } from '~common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { Filter } from '~common/interfaces/blockml/filter';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { FileFractionControl } from '~common/interfaces/blockml/internal/file-fraction-control';
import { FilePartTile } from '~common/interfaces/blockml/internal/file-part-tile';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { FileStoreFractionType } from '~common/interfaces/blockml/internal/file-store-fraction-type';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Model } from '~common/interfaces/blockml/model';
import { Query } from '~common/interfaces/blockml/query';
import { Tile } from '~common/interfaces/blockml/tile';
import { makeQueryId } from '~node-common/functions/make-query-id';
import { wrapMconfigChart } from './wrap-mconfig-chart';

export function wrapTiles(item: {
  structId: string;
  projectId: string;
  envId: string;
  tiles: FilePartTile[];
  mconfigParentType: MconfigParentTypeEnum;
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

  // console.log('item');
  // console.log(item);

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

    if (apiModel.type === ModelTypeEnum.Store) {
      store = stores.find(s => s.name === tile.model);
    }

    let queryId =
      apiModel.type === ModelTypeEnum.Store
        ? EMPTY_QUERY_ID
        : makeQueryId({
            projectId: projectId,
            connectionId: apiModel.connectionId,
            envId: envId,
            mconfigParentType: mconfigParentType,
            mconfigParentId: mconfigParentId,
            sql: tile.sql.join('\n'),
            storeTransformedRequestString: undefined, // isStore false
            store: undefined // isStore false
          });

    let query: Query = {
      queryId: queryId,
      projectId: projectId,
      envId: envId,
      connectionId: apiModel.connectionId,
      connectionType: apiModel.connectionType,
      sql:
        apiModel.type === ModelTypeEnum.Store ? undefined : tile.sql.join('\n'),
      apiMethod: undefined,
      apiUrl: undefined,
      apiBody: undefined,
      status: QueryStatusEnum.New,
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

    if (apiModel.type === ModelTypeEnum.Store) {
      tile.parameters.forEach(x => {
        let storeField = store.fields.find(k => k.name === x.apply_to);

        let filter: Filter = {
          fieldId: x.apply_to,
          fractions: x.fractions.map(y => {
            let storeResultCurrentTypeFraction: FileStoreFractionType;

            if (storeField.fieldClass !== FieldClassEnum.Filter) {
              storeResultCurrentTypeFraction = store.results
                .find(r => r.result === storeField.result)
                .fraction_types.find(ft => ft.type === y.type);
            }

            let storeFractionSubType =
              storeField.fieldClass === FieldClassEnum.Filter
                ? undefined
                : y.type;

            let storeFractionSubTypeOptions =
              storeField.fieldClass === FieldClassEnum.Filter
                ? undefined
                : store.results
                    .find(r => r.result === storeField.result)
                    .fraction_types.map(ft => {
                      let options = [];

                      let optionOr: FractionSubTypeOption = {
                        logicGroup: FractionLogicEnum.Or,
                        typeValue: ft.type,
                        value: `${FractionLogicEnum.Or}${TRIPLE_UNDERSCORE}${ft.type}`,
                        label: ft.label
                      };
                      options.push(optionOr);

                      let optionAndNot: FractionSubTypeOption = {
                        logicGroup: FractionLogicEnum.AndNot,
                        value: `${FractionLogicEnum.AndNot}${TRIPLE_UNDERSCORE}${ft.type}`,
                        typeValue: ft.type,
                        label: ft.label
                      };
                      options.push(optionAndNot);

                      return options;
                    })
                    .flat()
                    .sort((a, b) => {
                      if (a.logicGroup === b.logicGroup) return 0;
                      return a.logicGroup === FractionLogicEnum.Or ? -1 : 1;
                    });

            let fraction: Fraction = {
              meta:
                storeField.fieldClass === FieldClassEnum.Filter
                  ? undefined
                  : storeResultCurrentTypeFraction?.meta,
              operator:
                storeField.fieldClass === FieldClassEnum.Filter
                  ? undefined
                  : y.logic === FractionLogicEnum.Or
                    ? FractionOperatorEnum.Or
                    : FractionOperatorEnum.And,
              logicGroup:
                storeField.fieldClass === FieldClassEnum.Filter
                  ? undefined
                  : y.logic,
              brick: undefined,
              type: FractionTypeEnum.StoreFraction,
              storeFractionSubTypeOptions: storeFractionSubTypeOptions,
              storeFractionSubType: storeFractionSubType,
              storeFractionSubTypeLabel: isDefined(storeFractionSubType)
                ? storeFractionSubTypeOptions.find(
                    k => k.typeValue === storeFractionSubType
                  ).label
                : storeFractionSubType,
              storeFractionLogicGroupWithSubType:
                storeField.fieldClass === FieldClassEnum.Filter
                  ? undefined
                  : `${y.logic}${TRIPLE_UNDERSCORE}${y.type}`,
              controls: y.controls.map((control: FileFractionControl) => {
                let storeControl =
                  storeField.fieldClass === FieldClassEnum.Filter
                    ? storeField.fraction_controls.find(
                        fc => fc.name === control.name
                      )
                    : storeResultCurrentTypeFraction.controls.find(
                        fc => fc.name === control.name
                      );

                let newControl: FractionControl = {
                  options: storeControl?.options,
                  value:
                    control.controlClass === ControlClassEnum.Switch &&
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
        apiModel.type === ModelTypeEnum.Store &&
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
      limit: isDefined(tile.limit) ? Number(tile.limit) : 500,
      filters: filters.sort((a, b) =>
        a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
      ),
      chart: mconfigChart,
      serverTs: 1
    };

    // console.log('mconfig');
    // console.log(mconfig);

    mconfigs.push(mconfig);
    queries.push(query);
    apiTiles.push({
      modelId: tile.model,
      modelLabel: apiModel.label,
      modelFilePath: apiModel.filePath,
      mconfigId: mconfigId,
      queryId: queryId,
      trackChangeId: makeId(),
      // malloyQueryId: tile.query,
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
