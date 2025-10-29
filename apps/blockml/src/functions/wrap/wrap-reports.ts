import { TRIPLE_UNDERSCORE } from '~common/constants/top';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { ControlClassEnum } from '~common/enums/control-class.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { FieldAny } from '~common/interfaces/blockml/internal/field-any';
import { FileFractionControl } from '~common/interfaces/blockml/internal/file-fraction-control';
import { FileReport } from '~common/interfaces/blockml/internal/file-report';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { FileStoreFractionType } from '~common/interfaces/blockml/internal/file-store-fraction-type';
import { Model } from '~common/interfaces/blockml/model';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { Parameter } from '~common/interfaces/blockml/parameter';
import { Report } from '~common/interfaces/blockml/report';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { Row } from '~common/interfaces/blockml/row';
import { wrapMconfigChart } from './wrap-mconfig-chart';

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
                parentBrick: undefined,
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

    let mconfigChart = wrapMconfigChart({
      title: undefined,
      type: ChartTypeEnum.Line,
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
      fields: reportFields,
      accessRoles: x.access_roles || [],
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
          topLabel:
            row.type === RowTypeEnum.Metric ? metric.topLabel : undefined,
          partNodeLabel:
            row.type === RowTypeEnum.Metric ? metric.partNodeLabel : undefined,
          partFieldLabel:
            row.type === RowTypeEnum.Metric ? metric.partFieldLabel : undefined,
          partLabel:
            row.type === RowTypeEnum.Metric ? metric.partLabel : undefined,
          timeNodeLabel:
            row.type === RowTypeEnum.Metric ? metric.timeNodeLabel : undefined,
          timeFieldLabel:
            row.type === RowTypeEnum.Metric ? metric.timeFieldLabel : undefined,
          timeLabel:
            row.type === RowTypeEnum.Metric ? metric.timeLabel : undefined,
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
                let result: FieldResultEnum;
                let storeField: FieldAny;

                let model: Model;
                let store: FileStore;

                if (row.type === RowTypeEnum.Metric) {
                  model = models.find(m => m.modelId === metric.modelId);

                  let isStore = metric.modelType === ModelTypeEnum.Store;

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
                      : model.type !== ModelTypeEnum.Store
                        ? parameter.apiFractions
                        : parameter.fractions.map(y => {
                            let storeResultCurrentTypeFraction: FileStoreFractionType;

                            if (
                              storeField.fieldClass !== FieldClassEnum.Filter
                            ) {
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

                                      let optionAndNot: FractionSubTypeOption =
                                        {
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
                                      if (a.logicGroup === b.logicGroup)
                                        return 0;
                                      return a.logicGroup ===
                                        FractionLogicEnum.Or
                                        ? -1
                                        : 1;
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
                              parentBrick: undefined,
                              type: FractionTypeEnum.StoreFraction,
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
                                storeField.fieldClass === FieldClassEnum.Filter
                                  ? undefined
                                  : `${y.logic}${TRIPLE_UNDERSCORE}${y.type}`,
                              controls: y.controls.map(
                                (control: FileFractionControl) => {
                                  if (isDefined(control.input)) {
                                    control.name = control.input;
                                    control.controlClass =
                                      ControlClassEnum.Input;
                                  } else if (isDefined(control.list_input)) {
                                    control.name = control.list_input;
                                    control.controlClass =
                                      ControlClassEnum.ListInput;
                                  } else if (isDefined(control.switch)) {
                                    control.name = control.switch;
                                    control.controlClass =
                                      ControlClassEnum.Switch;
                                  } else if (isDefined(control.date_picker)) {
                                    control.name = control.date_picker;
                                    control.controlClass =
                                      ControlClassEnum.DatePicker;
                                  } else if (isDefined(control.selector)) {
                                    control.name = control.selector;
                                    control.controlClass =
                                      ControlClassEnum.Selector;
                                  }

                                  let storeControl =
                                    storeField.fieldClass ===
                                    FieldClassEnum.Filter
                                      ? storeField.fraction_controls.find(
                                          fc => fc.name === control.name
                                        )
                                      : storeResultCurrentTypeFraction.controls.find(
                                          fc => fc.name === control.name
                                        );

                                  let newControl: FractionControl = {
                                    options: storeControl?.options,
                                    value:
                                      control.controlClass ===
                                        ControlClassEnum.Switch &&
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
            : row.type === RowTypeEnum.Metric
              ? metric.formatNumber
              : formatNumber,
          currencyPrefix: isDefined(row.currency_prefix)
            ? row.currency_prefix
            : row.type === RowTypeEnum.Metric
              ? metric.currencyPrefix
              : currencyPrefix,
          currencySuffix: isDefined(row.currency_suffix)
            ? row.currency_suffix
            : row.type === RowTypeEnum.Metric
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
