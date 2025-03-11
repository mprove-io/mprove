import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { enums } from '~common/barrels/enums';
import { isDefined } from '~common/functions/is-defined';
import { toFileChartOptions } from '~common/functions/to-file-chart-options';
import { FileFraction } from '~common/interfaces/blockml/internal/file-fraction';
import { FileFractionControl } from '~common/interfaces/blockml/internal/file-fraction-control';

export function makeReportFileText(item: {
  reportId: string;
  title: string;
  accessRoles: string[];
  accessUsers: string[];
  rows: common.Row[];
  metrics: schemaPostgres.MetricEnt[];
  models: schemaPostgres.ModelEnt[];
  struct: schemaPostgres.StructEnt;
  newReportFields: common.ReportField[];
  chart: common.MconfigChart;
}) {
  let {
    reportId,
    title,
    rows,
    accessRoles,
    accessUsers,
    metrics,
    models,
    struct,
    newReportFields,
    chart
  } = item;

  let options = toFileChartOptions({
    chart: chart,
    isReport: true
  });

  let fileReport: common.FileReport = {
    fileName: undefined,
    fileExt: undefined,
    filePath: undefined,
    name: undefined,
    report: reportId,
    title: title,
    parameters:
      common.isDefined(newReportFields) && newReportFields.length > 0
        ? newReportFields.map(field => ({
            filter: field.id,
            hidden:
              common.isDefined(field.hidden) &&
              field.hidden !== common.REPORT_FIELD_DEFAULT_HIDDEN
                ? <any>field.hidden
                : undefined,
            label:
              common.isDefined(field.label) &&
              field.label.toUpperCase() !==
                common.MyRegex.replaceUnderscoresWithSpaces(
                  field.id
                ).toUpperCase()
                ? field.label
                : undefined,
            description:
              common.isDefined(field.description) && field.description !== ''
                ? field.description
                : undefined,
            result: field.result,
            suggest_model_dimension: field.suggestModelDimension,
            conditions:
              common.isDefined(field.fractions) && field.fractions.length > 0
                ? field.fractions.map(x => x.brick)
                : undefined
          }))
        : undefined,
    access_roles:
      accessRoles.length > 0 ? accessRoles.map(x => x.trim()) : undefined,
    access_users:
      accessUsers.length > 0 ? accessUsers.map(x => x.trim()) : undefined,
    rows: rows
      .filter(r => r.rowType !== common.RowTypeEnum.Global)
      .map(x => {
        // console.log('x');
        // console.log(x);

        let metric =
          x.rowType === common.RowTypeEnum.Metric
            ? metrics.find(m => m.metricId === x.metricId)
            : undefined;

        // console.log('metric');
        // console.log(metric);

        let model = common.isDefined(metric)
          ? models.find(m => m.modelId === metric.modelId)
          : undefined;

        // console.log('model.modelId');
        // console.log(model?.modelId);
        // console.log('model.isStoreModel');
        // console.log(model?.isStoreModel);

        let row: common.FileReportRow = {
          row_id: x.rowId,
          type: x.rowType,
          name:
            x.rowType === common.RowTypeEnum.Empty ||
            x.rowType === common.RowTypeEnum.Metric
              ? undefined
              : x.name,
          metric: x.metricId,
          formula: common.isDefined(x.formula) ? x.formula : undefined,
          show_chart:
            common.isDefined(x.showChart) &&
            x.showChart !== common.REPORT_ROW_DEFAULT_SHOW_CHART
              ? <any>x.showChart
              : undefined,
          format_number:
            x.rowType === common.RowTypeEnum.Metric &&
            metric.formatNumber === x.formatNumber
              ? undefined
              : struct.formatNumber === x.formatNumber
              ? undefined
              : x.formatNumber,
          currency_prefix:
            x.rowType === common.RowTypeEnum.Metric &&
            metric.currencyPrefix === x.currencyPrefix
              ? undefined
              : struct.currencyPrefix === x.currencyPrefix
              ? undefined
              : x.currencyPrefix,
          currency_suffix:
            x.rowType === common.RowTypeEnum.Metric &&
            metric.currencySuffix === x.currencySuffix
              ? undefined
              : struct.currencySuffix === x.currencySuffix
              ? undefined
              : x.currencySuffix,
          parameters_formula: common.isDefined(x.parametersFormula)
            ? x.parametersFormula
            : undefined,
          parameters:
            [common.RowTypeEnum.Metric].indexOf(x.rowType) < 0
              ? undefined
              : common.isDefined(x.parametersFormula)
              ? undefined
              : common.isDefined(x.parameters)
              ? x.parameters.map(parameter => {
                  let formula = common.isDefined(parameter.listen)
                    ? undefined
                    : parameter.formula;

                  let p: common.FileReportRowParameter = {
                    // type: parameter.parameterType,
                    apply_to: parameter.apply_to,
                    // result: parameter.result,
                    conditions:
                      common.isDefined(formula) ||
                      common.isDefined(parameter.listen) ||
                      model?.isStoreModel === true
                        ? undefined
                        : parameter.conditions,
                    fractions:
                      model?.isStoreModel === true
                        ? parameter.fractions.map(apiFraction => {
                            // console.log('apiFraction');
                            // console.log(apiFraction);

                            let fileFraction: FileFraction = {};

                            if (isDefined(apiFraction.logicGroup)) {
                              fileFraction.logic = apiFraction.logicGroup;
                            }

                            if (isDefined(apiFraction.storeFractionSubType)) {
                              fileFraction.type =
                                apiFraction.storeFractionSubType;
                            }

                            fileFraction.controls = apiFraction.controls.map(
                              mconfigControl => {
                                let newFileControl: FileFractionControl = {};

                                if (
                                  mconfigControl.controlClass ===
                                  enums.ControlClassEnum.Input
                                ) {
                                  newFileControl.input = mconfigControl.name;
                                } else if (
                                  mconfigControl.controlClass ===
                                  enums.ControlClassEnum.ListInput
                                ) {
                                  newFileControl.list_input =
                                    mconfigControl.name;
                                } else if (
                                  mconfigControl.controlClass ===
                                  enums.ControlClassEnum.Switch
                                ) {
                                  newFileControl.switch = mconfigControl.name;
                                } else if (
                                  mconfigControl.controlClass ===
                                  enums.ControlClassEnum.DatePicker
                                ) {
                                  newFileControl.date_picker =
                                    mconfigControl.name;
                                } else if (
                                  mconfigControl.controlClass ===
                                  enums.ControlClassEnum.Selector
                                ) {
                                  newFileControl.selector = mconfigControl.name;
                                }

                                newFileControl.value = mconfigControl.value;

                                return newFileControl;
                              }
                            );

                            return fileFraction;
                          })
                        : undefined,
                    formula: formula,
                    listen: parameter.listen,
                    globalFieldResult: undefined
                  };

                  return p;
                })
              : []
        };

        return row;
      }),
    options: options
  };

  let fileReportText = common.toYaml(fileReport);

  return fileReportText;
}
