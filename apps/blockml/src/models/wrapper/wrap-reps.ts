import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';

export function wrapReps(item: {
  projectId: string;
  structId: string;
  reps: common.FileRep[];
  metrics: common.MetricAny[];
  models: common.FileModel[];
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
          rowId: row.id,
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
          rqs: [],
          query: undefined,
          mconfig: undefined,
          hasAccessToModel: false,
          parameters: row.parameters?.map(parameter => {
            let result: common.FieldResultEnum;

            if (row.type === common.RowTypeEnum.Metric) {
              result = models
                .find(model => model.modelId === metric.modelId)
                .fields.find(field => field.id === parameter.field).result;
            }

            let parameterApi: common.Parameter = {
              parameterId: parameter.id,
              parameterType: parameter.type,
              fieldId: parameter.field,
              result: result,
              formula: parameter.formula,
              conditions: parameter.conditions,
              value: parameter.value
            };

            return parameterApi;
          }),
          parametersFormula: row.parameters_formula,
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
