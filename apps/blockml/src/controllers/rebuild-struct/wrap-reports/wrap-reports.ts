import { wrapMconfigChart } from '#blockml/functions/wrap-mconfig-chart/wrap-mconfig-chart';
import { TRIPLE_UNDERSCORE } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string/to-boolean-from-lowercase-string';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionControl } from '#common/types/blockml/parts/fraction/fraction-control';
import type { FractionSubTypeOption } from '#common/types/blockml/parts/fraction/fraction-sub-type-option';
import type { FieldAny } from '#common/types/blockml/parts/internal/field-any';
import type { FileFractionControl } from '#common/types/blockml/parts/internal/file-fraction-control';
import type { FileReport } from '#common/types/blockml/parts/internal/file-report';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { FileStoreFractionType } from '#common/types/blockml/parts/internal/file-store-fraction-type';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import type { Report } from '#common/types/blockml/parts/report/report';
import type { ReportField } from '#common/types/blockml/parts/report/report-field';
import type { Parameter } from '#common/types/blockml/parts/report/row/parameter';
import type { Row } from '#common/types/blockml/parts/report/row/row';

export function wrapReports(item: {
  projectId: string;
  structId: string;
  reports: FileReport[];
  metrics: ModelMetric[];
  models: Model[];
  formatNumber: string;
  currencyPrefix: string;
  currencySuffix: string;
}) {
  let {
    projectId,
    structId,
    reports,
    metrics,
    models,
    currencyPrefix,
    currencySuffix,
    formatNumber
  } = item;

  let apiReports: Report[] = reports.map(x => {
    let reportFields: ReportField[] = [];

    x.fields.forEach(field => {
      reportFields.push({
        id: field.name,
        hidden: toBooleanFromLowercaseString(field.hidden),
        label: field.label,
        result: field.result,
        maxFractions:
          isDefined(field.store_model) && isDefined(field.store_filter)
            ? Number(
                models
                  .find(model => model.modelId === field.store_model)
                  .storeContent.fields.find(k => k.name === field.store_filter)
                  .max_fractions
              )
            : undefined,
        storeModel: field.store_model,
        storeResult: field.store_result,
        storeFilter: field.store_filter,
        fractions: isUndefined(field.store_model)
          ? field.apiFractions
          : field.fractions.map(y => {
              let store = models.find(
                model => model.modelId === field.store_model
              ).storeContent;

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

    let mconfigChart = wrapMconfigChart({
      title: undefined,
      type: 'line',
      options: x.options,
      isReport: true,
      rowIdsWithShowChart: x.rows
        .filter(row => toBooleanFromLowercaseString(row.show_chart) === true)
        .map(row => row.row_id)
        .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0)),
      data: undefined
    });

    let report: Report = {
      projectId: projectId,
      structId: structId,
      reportId: x.name,
      draft: false,
      creatorId: undefined,
      filePath: x.filePath,
      space: x.space,
      fields: reportFields,
      accessRoles: x.access_roles || [],
      accessRolesCombined: x.accessRolesCombined || [],
      title: x.title,
      timezone: undefined,
      timeSpec: undefined,
      timeRangeFraction: undefined,
      rangeStart: undefined,
      rangeEnd: undefined,
      columns: [],
      rows: x.rows.map(row => {
        let metric: ModelMetric = metrics.find(m => m.metricId === row.metric);

        let rowApi: Row = {
          rowId: row.row_id,
          rowType: row.type,
          name: row.name,
          topLabel: row.type === 'metric' ? metric.topLabel : undefined,
          partNodeLabel:
            row.type === 'metric' ? metric.partNodeLabel : undefined,
          partFieldLabel:
            row.type === 'metric' ? metric.partFieldLabel : undefined,
          partLabel: row.type === 'metric' ? metric.partLabel : undefined,
          timeNodeLabel:
            row.type === 'metric' ? metric.timeNodeLabel : undefined,
          timeFieldLabel:
            row.type === 'metric' ? metric.timeFieldLabel : undefined,
          timeLabel: row.type === 'metric' ? metric.timeLabel : undefined,
          metricId: row.metric,
          modelId: row.model,
          showChart: toBooleanFromLowercaseString(row.show_chart),
          formula: row.formula,
          rqs: [],
          query: undefined,
          mconfig: undefined,
          hasAccessToModel: false,
          parameters: isUndefined(row.parameters)
            ? []
            : row.parameters.map(parameter => {
                let result: FieldResult;
                let storeField: FieldAny;

                let model: Model;
                let store: FileStore;

                if (row.type === 'metric') {
                  model = models.find(m => m.modelId === metric.modelId);

                  let isStore = metric.modelType === 'Store';

                  if (isStore === true) {
                    store = model.storeContent;
                    storeField = store.fields.find(
                      k => k.name === parameter.apply_to
                    );
                  }

                  result = models
                    .find(m => m.modelId === metric.modelId)
                    .fields.find(
                      field => field.id === parameter.apply_to
                    ).result;
                }

                let parameterApi: Parameter = {
                  apply_to: parameter.apply_to,
                  fractions:
                    isUndefined(model) || isDefined(parameter.listen)
                      ? undefined
                      : model.type !== 'Store'
                        ? parameter.apiFractions
                        : parameter.fractions.map(y => {
                            let storeResultCurrentTypeFraction: FileStoreFractionType;

                            if (storeField.fieldClass !== 'filter') {
                              storeResultCurrentTypeFraction = store.results
                                .find(r => r.result === storeField.result)
                                .fraction_types.find(ft => ft.type === y.type);
                            }

                            let storeFractionSubType =
                              storeField.fieldClass === 'filter'
                                ? undefined
                                : y.type;

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

                                      let optionAndNot: FractionSubTypeOption =
                                        {
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
                                      if (a.logicGroup === b.logicGroup)
                                        return 0;
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
                                storeField.fieldClass === 'filter'
                                  ? undefined
                                  : y.logic,
                              brick: undefined,
                              parentBrick: undefined,
                              type: 'StoreFraction',
                              storeFractionSubTypeOptions:
                                storeFractionSubTypeOptions,
                              storeFractionSubType: storeFractionSubType,
                              storeFractionSubTypeLabel: isDefined(
                                storeFractionSubType
                              )
                                ? storeFractionSubTypeOptions.find(
                                    k => k.typeValue === storeFractionSubType
                                  ).label
                                : storeFractionSubType,
                              storeFractionLogicGroupWithSubType:
                                storeField.fieldClass === 'filter'
                                  ? undefined
                                  : `${y.logic}${TRIPLE_UNDERSCORE}${y.type}`,
                              controls: y.controls.map(
                                (control: FileFractionControl) => {
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
                                        ? toBooleanFromLowercaseString(
                                            control.value
                                          )
                                        : control.value,
                                    label: storeControl.label,
                                    required: storeControl.required,
                                    name: control.name,
                                    controlClass: control.controlClass,
                                    isMetricsDate: storeControl.isMetricsDate
                                  };
                                  return newControl;
                                }
                              )
                            };
                            return fraction;
                          }),
                  listen: parameter.listen
                };

                return parameterApi;
              }),
          parametersFiltersWithExcludedTime: [],
          deps: undefined,
          formulaDeps: undefined,
          records: [],
          formatNumber: isDefined(row.format_number)
            ? row.format_number
            : row.type === 'metric'
              ? metric.formatNumber
              : formatNumber,
          currencyPrefix: isDefined(row.currency_prefix)
            ? row.currency_prefix
            : row.type === 'metric'
              ? metric.currencyPrefix
              : currencyPrefix,
          currencySuffix: isDefined(row.currency_suffix)
            ? row.currency_suffix
            : row.type === 'metric'
              ? metric.currencySuffix
              : currencySuffix
        };
        return rowApi;
      }),
      timeColumnsLength: undefined,
      timeColumnsLimit: undefined,
      isTimeColumnsLimitExceeded: false,
      chart: mconfigChart,
      draftCreatedTs: 1,
      serverTs: 1
    };
    return report;
  });

  return apiReports;
}
