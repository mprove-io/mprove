import { common } from '~blockml/barrels/common';
import { STORE_MODEL_PREFIX } from '~common/constants/top';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { FileFractionControl } from '~common/interfaces/blockml/internal/file-fraction-control';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { wrapMconfigChart } from './wrap-mconfig-chart';

export function wrapReports(item: {
  projectId: string;
  structId: string;
  reports: common.FileReport[];
  metrics: common.ModelMetric[];
  models: common.Model[];
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

  let apiReports: common.Report[] = reports.map(x => {
    let reportFields: common.ReportField[] = [];

    x.fields.forEach(field => {
      reportFields.push({
        id: field.name,
        hidden: common.toBooleanFromLowercaseString(field.hidden),
        label: field.label,
        result: field.result,
        maxFractions:
          common.isDefined(field.store_model) &&
          common.isDefined(field.store_filter)
            ? Number(
                (
                  models.find(model => model.modelId === field.store_model)
                    .content as FileStore
                ).fields.find(k => k.name === field.store_filter).max_fractions
              )
            : undefined,
        storeModel: field.store_model,
        storeResult: field.store_result,
        storeFilter: field.store_filter,
        fractions: common.isUndefined(field.store_model)
          ? field.apiFractions
          : field.fractions.map(y => {
              let store = models.find(
                model => model.modelId === field.store_model
              ).content as FileStore;

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

                      let optionOr: common.FractionSubTypeOption = {
                        logicGroup: common.FractionLogicEnum.Or,
                        typeValue: ft.type,
                        value: `${common.FractionLogicEnum.Or}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                        label: ft.label
                      };
                      options.push(optionOr);

                      let optionAndNot: common.FractionSubTypeOption = {
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
                  : `${y.logic}${common.TRIPLE_UNDERSCORE}${y.type}`,
                controls: y.controls.map(
                  (control: common.FileFractionControl) => {
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
                        control.controlClass ===
                          common.ControlClassEnum.Switch &&
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
                  }
                )
              };
              return fraction;
            }),
        description: field.description,
        suggestModelDimension: field.suggest_model_dimension
      });
    });

    let mconfigChart = wrapMconfigChart({
      title: undefined,
      description: undefined,
      type: common.ChartTypeEnum.Line,
      options: x.options,
      isReport: true,
      rowIdsWithShowChart: x.rows
        .filter(
          row => common.toBooleanFromLowercaseString(row.show_chart) === true
        )
        .map(row => row.row_id)
        .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0)),
      data: undefined
    });

    let report: common.Report = {
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
      // rangeOpen: undefined,
      // rangeClose: undefined,
      rangeStart: undefined,
      rangeEnd: undefined,
      columns: [],
      rows: x.rows.map(row => {
        let metric: common.ModelMetric = metrics.find(
          m => m.metricId === row.metric
        );

        let rowApi: common.Row = {
          rowId: row.row_id,
          rowType: row.type,
          name: row.name,
          topLabel:
            row.type === common.RowTypeEnum.Metric
              ? metric.topLabel
              : undefined,
          partNodeLabel:
            row.type === common.RowTypeEnum.Metric
              ? metric.partNodeLabel
              : undefined,
          partFieldLabel:
            row.type === common.RowTypeEnum.Metric
              ? metric.partFieldLabel
              : undefined,
          partLabel:
            row.type === common.RowTypeEnum.Metric
              ? metric.partLabel
              : undefined,
          timeNodeLabel:
            row.type === common.RowTypeEnum.Metric
              ? metric.timeNodeLabel
              : undefined,
          timeFieldLabel:
            row.type === common.RowTypeEnum.Metric
              ? metric.timeFieldLabel
              : undefined,
          timeLabel:
            row.type === common.RowTypeEnum.Metric
              ? metric.timeLabel
              : undefined,
          metricId: row.metric,
          showChart: common.toBooleanFromLowercaseString(row.show_chart),
          formula: row.formula,
          rqs: [],
          query: undefined,
          mconfig: undefined,
          hasAccessToModel: false,
          parameters: common.isUndefined(row.parameters)
            ? []
            : row.parameters.map(parameter => {
                let result: common.FieldResultEnum;
                let storeField: common.FieldAny;

                let model: common.Model;
                let store: FileStore;

                if (row.type === common.RowTypeEnum.Metric) {
                  model = models.find(m => m.modelId === metric.modelId);

                  let isStore = metric.modelId.startsWith(STORE_MODEL_PREFIX);

                  if (isStore === true) {
                    store = model.content as FileStore;
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

                let parameterApi: common.Parameter = {
                  apply_to: parameter.apply_to,
                  fractions:
                    common.isUndefined(model) ||
                    common.isDefined(parameter.listen)
                      ? undefined
                      : model.type !== common.ModelTypeEnum.Store
                        ? // model.isStoreModel === false
                          parameter.apiFractions
                        : parameter.fractions.map(y => {
                            let storeResultCurrentTypeFraction: common.FileStoreFractionType;

                            if (
                              storeField.fieldClass !==
                              common.FieldClassEnum.Filter
                            ) {
                              storeResultCurrentTypeFraction = store.results
                                .find(r => r.result === storeField.result)
                                .fraction_types.find(ft => ft.type === y.type);
                            }

                            let storeFractionSubType =
                              storeField.fieldClass ===
                              common.FieldClassEnum.Filter
                                ? undefined
                                : y.type;

                            let storeFractionSubTypeOptions =
                              storeField.fieldClass ===
                              common.FieldClassEnum.Filter
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

                                      let optionAndNot: FractionSubTypeOption =
                                        {
                                          logicGroup:
                                            common.FractionLogicEnum.AndNot,
                                          value: `${common.FractionLogicEnum.AndNot}${common.TRIPLE_UNDERSCORE}${ft.type}`,
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
                                        common.FractionLogicEnum.Or
                                        ? -1
                                        : 1;
                                    });

                            let fraction: common.Fraction = {
                              meta:
                                storeField.fieldClass ===
                                common.FieldClassEnum.Filter
                                  ? undefined
                                  : storeResultCurrentTypeFraction?.meta,
                              operator:
                                storeField.fieldClass ===
                                common.FieldClassEnum.Filter
                                  ? undefined
                                  : y.logic === common.FractionLogicEnum.Or
                                    ? common.FractionOperatorEnum.Or
                                    : common.FractionOperatorEnum.And,
                              logicGroup:
                                storeField.fieldClass ===
                                common.FieldClassEnum.Filter
                                  ? undefined
                                  : y.logic,
                              brick: undefined,
                              type: common.FractionTypeEnum.StoreFraction,
                              storeFractionSubTypeOptions:
                                storeFractionSubTypeOptions,
                              storeFractionSubType: storeFractionSubType,
                              storeFractionSubTypeLabel: common.isDefined(
                                storeFractionSubType
                              )
                                ? storeFractionSubTypeOptions.find(
                                    k => k.typeValue === storeFractionSubType
                                  ).label
                                : storeFractionSubType,
                              storeFractionLogicGroupWithSubType:
                                storeField.fieldClass ===
                                common.FieldClassEnum.Filter
                                  ? undefined
                                  : `${y.logic}${common.TRIPLE_UNDERSCORE}${y.type}`,
                              controls: y.controls.map(
                                (control: FileFractionControl) => {
                                  if (common.isDefined(control.input)) {
                                    control.name = control.input;
                                    control.controlClass =
                                      common.ControlClassEnum.Input;
                                  } else if (
                                    common.isDefined(control.list_input)
                                  ) {
                                    control.name = control.list_input;
                                    control.controlClass =
                                      common.ControlClassEnum.ListInput;
                                  } else if (common.isDefined(control.switch)) {
                                    control.name = control.switch;
                                    control.controlClass =
                                      common.ControlClassEnum.Switch;
                                  } else if (
                                    common.isDefined(control.date_picker)
                                  ) {
                                    control.name = control.date_picker;
                                    control.controlClass =
                                      common.ControlClassEnum.DatePicker;
                                  } else if (
                                    common.isDefined(control.selector)
                                  ) {
                                    control.name = control.selector;
                                    control.controlClass =
                                      common.ControlClassEnum.Selector;
                                  }

                                  let storeControl =
                                    storeField.fieldClass ===
                                    common.FieldClassEnum.Filter
                                      ? storeField.fraction_controls.find(
                                          fc => fc.name === control.name
                                        )
                                      : storeResultCurrentTypeFraction.controls.find(
                                          fc => fc.name === control.name
                                        );

                                  let newControl: common.FractionControl = {
                                    options: storeControl?.options,
                                    value:
                                      control.controlClass ===
                                        common.ControlClassEnum.Switch &&
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
          formatNumber: common.isDefined(row.format_number)
            ? row.format_number
            : row.type === common.RowTypeEnum.Metric
              ? metric.formatNumber
              : formatNumber,
          currencyPrefix: common.isDefined(row.currency_prefix)
            ? row.currency_prefix
            : row.type === common.RowTypeEnum.Metric
              ? metric.currencyPrefix
              : currencyPrefix,
          currencySuffix: common.isDefined(row.currency_suffix)
            ? row.currency_suffix
            : row.type === common.RowTypeEnum.Metric
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
