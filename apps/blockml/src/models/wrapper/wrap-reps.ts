import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';

export function wrapReps(item: {
  projectId: string;
  structId: string;
  reps: common.FileRep[];
  metrics: common.MetricAny[];
  models: common.Model[];
  formatNumber: string;
  currencyPrefix: string;
  currencySuffix: string;
}) {
  let {
    projectId,
    structId,
    reps,
    metrics,
    models,
    currencyPrefix,
    currencySuffix,
    formatNumber
  } = item;

  let apiReps: common.Rep[] = reps.map(x => {
    let rep: common.Rep = {
      projectId: projectId,
      structId: structId,
      repId: x.name,
      draft: false,
      creatorId: undefined,
      filePath: x.filePath,
      accessUsers: x.access_users || [],
      accessRoles: x.access_roles || [],
      title: x.title,
      timezone: undefined,
      timeSpec: undefined,
      timeRangeFraction: undefined,
      columns: [],
      rows: x.rows.map(row => {
        let metric: common.MetricAny = metrics.find(
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
          partLabel:
            row.type === common.RowTypeEnum.Metric
              ? metric.partLabel
              : undefined,
          timeLabel:
            row.type === common.RowTypeEnum.Metric
              ? metric.timeLabel
              : undefined,
          metricId: row.metric,
          showChart: helper.toBooleanFromLowercaseString(row.show_chart),
          formula: row.formula,
          formulaDeps: undefined,
          rcs: [],
          rqs: [],
          query: undefined,
          mconfig: undefined,
          hasAccessToModel: false,
          parameters: row.parameters?.map(parameter => {
            let result: common.FieldResultEnum;

            if (row.type === common.RowTypeEnum.Metric) {
              result = models
                .find(model => model.modelId === metric.modelId)
                .fields.find(field => field.id === parameter.filter).result;
            }

            let parameterApi: common.Parameter = {
              parameterId: [row.row_id, ...parameter.filter.split('.')]
                .join('_')
                .toUpperCase(),
              parameterType: common.isDefined(parameter.formula)
                ? common.ParameterTypeEnum.Formula
                : common.ParameterTypeEnum.Field,
              filter: parameter.filter,
              result: result,
              formula: parameter.formula,
              formulaDeps: undefined,
              conditions: parameter.conditions
            };

            return parameterApi;
          }),
          paramsFiltersWithExcludedTime: [],
          parametersJson: undefined,
          parametersFormula: row.parameters_formula,
          parametersFormulaDeps: undefined,
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
      draftCreatedTs: 1,
      serverTs: 1
    };
    return rep;
  });

  return apiReps;
}
