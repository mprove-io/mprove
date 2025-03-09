import { common } from '~blockml/barrels/common';
import { STORE_MODEL_PREFIX } from '~common/_index';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { FileFractionControl } from '~common/interfaces/blockml/internal/file-fraction-control';
import { wrapTiles } from './wrap-tiles';

export function wrapDashboards(item: {
  structId: string;
  orgId: string;
  projectId: string;
  dashboards: common.FileDashboard[];
  models: common.FileModel[];
  stores: common.FileStore[];
  envId: string;
  timezone: string;
}) {
  let {
    structId,
    orgId,
    projectId,
    models,
    stores,
    dashboards,
    envId,
    timezone
  } = item;

  let apiDashboards: common.Dashboard[] = [];
  let dashMconfigs: common.Mconfig[] = [];
  let dashQueries: common.Query[] = [];

  dashboards.forEach(x => {
    let dashFields: common.DashboardField[] = [];

    x.fields.forEach(field => {
      dashFields.push({
        id: field.name,
        hidden: common.toBooleanFromLowercaseString(field.hidden),
        label: field.label,
        result: field.result,
        maxFractions:
          common.isDefined(field.store) && common.isDefined(field.store_filter)
            ? Number(
                stores
                  .find(s => `${STORE_MODEL_PREFIX}_${s.name}` === field.store)
                  .fields.find(k => k.name === field.store_filter).max_fractions
              )
            : undefined,
        store: field.store,
        storeResult: field.store_result,
        storeFilter: field.store_filter,
        fractions: common.isUndefined(field.store)
          ? field.fieldFractions
          : field.fractions.map(y => {
              let store = stores.find(
                s => `${STORE_MODEL_PREFIX}_${s.name}` === field.store
              );

              let storeResultCurrentTypeFraction: common.FileStoreFractionType;

              if (common.isDefined(field.store_result)) {
                storeResultCurrentTypeFraction = store.results
                  .find(r => r.result === field.store_result)
                  .fraction_types.find(ft => ft.type === y.type);
              }

              let storeFractionSubType = common.isDefined(field.store_filter)
                ? undefined
                : y.type;

              let storeFractionSubTypeOptions = common.isDefined(
                field.store_filter
              )
                ? undefined
                : store.results
                    .find(r => r.result === field.store_result)
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
                    });

              let fraction: common.Fraction = {
                meta: common.isDefined(field.store_filter)
                  ? undefined
                  : storeResultCurrentTypeFraction?.meta,
                operator: common.isDefined(field.store_filter)
                  ? undefined
                  : y.logic === common.FractionLogicEnum.Or
                  ? common.FractionOperatorEnum.Or
                  : common.FractionOperatorEnum.And,
                logicGroup: common.isDefined(field.store_filter)
                  ? undefined
                  : y.logic,
                brick: undefined,
                type: common.FractionTypeEnum.StoreFraction,
                storeFractionSubTypeOptions: storeFractionSubTypeOptions,
                storeFractionSubType: storeFractionSubType,
                storeFractionSubTypeLabel: common.isDefined(
                  storeFractionSubType
                )
                  ? storeFractionSubTypeOptions.find(
                      k => k.typeValue === storeFractionSubType
                    ).label
                  : storeFractionSubType,
                storeFractionLogicGroupWithSubType: common.isDefined(
                  field.store_filter
                )
                  ? undefined
                  : y.logic + y.type,
                controls: y.controls.map((control: FileFractionControl) => {
                  if (common.isDefined(control.input)) {
                    control.name = control.input;
                    control.controlClass = common.ControlClassEnum.Input;
                  } else if (common.isDefined(control.list_input)) {
                    control.name = control.list_input;
                    control.controlClass = common.ControlClassEnum.ListInput;
                  } else if (common.isDefined(control.switch)) {
                    control.name = control.switch;
                    control.controlClass = common.ControlClassEnum.Switch;
                  } else if (common.isDefined(control.date_picker)) {
                    control.name = control.date_picker;
                    control.controlClass = common.ControlClassEnum.DatePicker;
                  } else if (common.isDefined(control.selector)) {
                    control.name = control.selector;
                    control.controlClass = common.ControlClassEnum.Selector;
                  }

                  let storeField = common.isDefined(field.store_filter)
                    ? store.fields.find(k => k.name === field.store_filter)
                    : undefined;

                  let storeControl = common.isDefined(field.store_filter)
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
                    isMetricsDate: undefined
                  };
                  return newControl;
                })
              };
              return fraction;
            }),
        description: field.description,
        suggestModelDimension: field.suggest_model_dimension
      });
    });

    let { apiTiles, mconfigs, queries } = wrapTiles({
      orgId: orgId,
      projectId: projectId,
      structId: structId,
      models: models,
      stores: stores,
      tiles: x.tiles,
      envId: envId,
      timezone: timezone
    });

    dashMconfigs = [...dashMconfigs, ...mconfigs];
    dashQueries = [...dashQueries, ...queries];

    apiDashboards.push({
      structId: structId,
      dashboardId: x.name,
      filePath: x.filePath,
      content: x,
      accessUsers: x.access_users || [],
      accessRoles: x.access_roles || [],
      title: x.title,
      description: x.description,
      gr: x.group,
      hidden: common.toBooleanFromLowercaseString(x.hidden),
      fields: dashFields,
      tiles: apiTiles,
      temp: false,
      serverTs: 1
    });
  });

  return {
    apiDashboards: apiDashboards,
    dashMconfigs: dashMconfigs,
    dashQueries: dashQueries
  };
}
