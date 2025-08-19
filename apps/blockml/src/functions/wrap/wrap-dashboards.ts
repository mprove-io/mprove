import { TRIPLE_UNDERSCORE } from '~common/constants/top';
import { ControlClassEnum } from '~common/enums/control-class.enum';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { Dashboard } from '~common/interfaces/blockml/dashboard';
import { DashboardField } from '~common/interfaces/blockml/dashboard-field';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { FileDashboard } from '~common/interfaces/blockml/internal/file-dashboard';
import { FileFractionControl } from '~common/interfaces/blockml/internal/file-fraction-control';
import { FileMod } from '~common/interfaces/blockml/internal/file-mod';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { FileStoreFractionType } from '~common/interfaces/blockml/internal/file-store-fraction-type';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Model } from '~common/interfaces/blockml/model';
import { Query } from '~common/interfaces/blockml/query';
import { wrapTiles } from './wrap-tiles';

export function wrapDashboards(item: {
  structId: string;
  projectId: string;
  dashboards: FileDashboard[];
  apiModels: Model[];
  stores: FileStore[];
  mods: FileMod[];
  envId: string;
  timezone: string;
}) {
  let {
    structId,
    projectId,
    apiModels,
    stores,
    mods,
    dashboards,
    envId,
    timezone
  } = item;

  let apiDashboards: Dashboard[] = [];
  let dashMconfigs: Mconfig[] = [];
  let dashQueries: Query[] = [];

  dashboards.forEach(x => {
    let dashFields: DashboardField[] = [];

    x.fields.forEach(field => {
      dashFields.push({
        id: field.name,
        hidden: toBooleanFromLowercaseString(field.hidden),
        label: field.label,
        result: field.result,
        maxFractions:
          isDefined(field.store_model) && isDefined(field.store_filter)
            ? Number(
                stores
                  .find(s => s.name === field.store_model)
                  .fields.find(k => k.name === field.store_filter).max_fractions
              )
            : undefined,
        storeModel: field.store_model,
        storeResult: field.store_result,
        storeFilter: field.store_filter,
        fractions: isUndefined(field.store_model)
          ? field.apiFractions
          : field.fractions.map(y => {
              let store = stores.find(s => s.name === field.store_model);

              let storeResultCurrentTypeFraction: FileStoreFractionType;

              if (isDefined(field.store_result)) {
                storeResultCurrentTypeFraction = store.results
                  .find(r => r.result === field.store_result)
                  .fraction_types.find(ft => ft.type === y.type);
              }

              let storeFractionSubType = isDefined(field.store_filter)
                ? undefined
                : y.type;

              let storeFractionSubTypeOptions = isDefined(field.store_filter)
                ? undefined
                : store.results
                    .find(r => r.result === field.store_result)
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
                meta: isDefined(field.store_filter)
                  ? undefined
                  : storeResultCurrentTypeFraction?.meta,
                operator: isDefined(field.store_filter)
                  ? undefined
                  : y.logic === FractionLogicEnum.Or
                    ? FractionOperatorEnum.Or
                    : FractionOperatorEnum.And,
                logicGroup: isDefined(field.store_filter) ? undefined : y.logic,
                brick: undefined,
                type: FractionTypeEnum.StoreFraction,
                storeFractionSubTypeOptions: storeFractionSubTypeOptions,
                storeFractionSubType: storeFractionSubType,
                storeFractionSubTypeLabel: isDefined(storeFractionSubType)
                  ? storeFractionSubTypeOptions.find(
                      k => k.typeValue === storeFractionSubType
                    ).label
                  : storeFractionSubType,
                storeFractionLogicGroupWithSubType: isDefined(
                  field.store_filter
                )
                  ? undefined
                  : `${y.logic}${TRIPLE_UNDERSCORE}${y.type}`,
                controls: y.controls.map((control: FileFractionControl) => {
                  if (isDefined(control.input)) {
                    control.name = control.input;
                    control.controlClass = ControlClassEnum.Input;
                  } else if (isDefined(control.list_input)) {
                    control.name = control.list_input;
                    control.controlClass = ControlClassEnum.ListInput;
                  } else if (isDefined(control.switch)) {
                    control.name = control.switch;
                    control.controlClass = ControlClassEnum.Switch;
                  } else if (isDefined(control.date_picker)) {
                    control.name = control.date_picker;
                    control.controlClass = ControlClassEnum.DatePicker;
                  } else if (isDefined(control.selector)) {
                    control.name = control.selector;
                    control.controlClass = ControlClassEnum.Selector;
                  }

                  let storeField = isDefined(field.store_filter)
                    ? store.fields.find(k => k.name === field.store_filter)
                    : undefined;

                  let storeControl = isDefined(field.store_filter)
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
            }),
        description: field.description,
        suggestModelDimension: field.suggest_model_dimension
      });
    });

    let { apiTiles, mconfigs, queries } = wrapTiles({
      projectId: projectId,
      structId: structId,
      apiModels: apiModels,
      mods: mods,
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
      draft: false,
      creatorId: undefined,
      filePath: x.filePath,
      content: x,
      accessRoles: x.access_roles || [],
      title: x.title,
      description: x.description,
      gr: x.group,
      hidden: toBooleanFromLowercaseString(x.hidden),
      fields: dashFields,
      tiles: apiTiles,
      serverTs: 1
    });
  });

  return {
    apiDashboards: apiDashboards,
    dashMconfigs: dashMconfigs,
    dashQueries: dashQueries
  };
}
