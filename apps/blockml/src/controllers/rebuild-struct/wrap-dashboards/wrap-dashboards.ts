import { wrapTiles } from '#blockml/functions/wrap-tiles/wrap-tiles';
import { TRIPLE_UNDERSCORE } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string/to-boolean-from-lowercase-string';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';
import type { DashboardField } from '#common/types/blockml/parts/dashboard/dashboard-field';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionControl } from '#common/types/blockml/parts/fraction/fraction-control';
import type { FractionLogic } from '#common/types/blockml/parts/fraction/fraction-logic';
import type { FractionSubTypeOption } from '#common/types/blockml/parts/fraction/fraction-sub-type-option';
import type { FileDashboard } from '#common/types/blockml/parts/internal/file-dashboard';
import type { FileFractionControl } from '#common/types/blockml/parts/internal/file-fraction-control';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { FileStoreFractionType } from '#common/types/blockml/parts/internal/file-store-fraction-type';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { Query } from '#common/types/blockml/parts/query/query';

export function wrapDashboards(item: {
  structId: string;
  projectId: string;
  dashboards: FileDashboard[];
  apiModels: Model[];
  stores: FileStore[];
  envId: string;
  timezone: string;
}) {
  let { structId, projectId, apiModels, stores, dashboards, envId, timezone } =
    item;

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
                        logicGroup: 'OR',
                        typeValue: ft.type,
                        value: `${'OR' satisfies FractionLogic}${TRIPLE_UNDERSCORE}${ft.type}`,
                        label: ft.label
                      };
                      options.push(optionOr);

                      let optionAndNot: FractionSubTypeOption = {
                        logicGroup: 'AND_NOT',
                        value: `${'AND_NOT' satisfies FractionLogic}${TRIPLE_UNDERSCORE}${ft.type}`,
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
                meta: isDefined(field.store_filter)
                  ? undefined
                  : storeResultCurrentTypeFraction?.meta,
                operator: isDefined(field.store_filter)
                  ? undefined
                  : y.logic === 'OR'
                    ? 'Or'
                    : 'And',
                logicGroup: isDefined(field.store_filter) ? undefined : y.logic,
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
                storeFractionLogicGroupWithSubType: isDefined(
                  field.store_filter
                )
                  ? undefined
                  : `${y.logic}${TRIPLE_UNDERSCORE}${y.type}`,
                controls: y.controls.map((control: FileFractionControl) => {
                  if (isDefined(control.input)) {
                    control.name = control.input;
                    control.controlClass = 'input';
                  } else if (isDefined(control.list_input)) {
                    control.name = control.list_input;
                    control.controlClass = 'list_input';
                  } else if (isDefined(control.switch)) {
                    control.name = control.switch;
                    control.controlClass = 'switch';
                  } else if (isDefined(control.date_picker)) {
                    control.name = control.date_picker;
                    control.controlClass = 'date_picker';
                  } else if (isDefined(control.selector)) {
                    control.name = control.selector;
                    control.controlClass = 'selector';
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
            }),
        description: field.description,
        suggestModelDimension: field.suggest_model_dimension
      });
    });

    let { apiTiles, mconfigs, queries } = wrapTiles({
      projectId: projectId,
      structId: structId,
      apiModels: apiModels,
      stores: stores,
      tiles: x.tiles,
      mconfigParentType: 'Dashboard',
      mconfigParentId: x.dashboard,
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
      space: x.space,
      content: x,
      accessRoles: x.access_roles || [],
      accessRolesCombined: x.accessRolesCombined || [],
      title: x.title,
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
