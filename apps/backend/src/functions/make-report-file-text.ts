import { ModelTab, StructTab } from '~backend/drizzle/postgres/schema/_tabs';
import {
  REPORT_FIELD_DEFAULT_HIDDEN,
  REPORT_ROW_DEFAULT_SHOW_CHART
} from '~common/constants/top';
import { ControlClassEnum } from '~common/enums/control-class.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { toFileChartOptions } from '~common/functions/to-file-chart-options';
import { toYaml } from '~common/functions/to-yaml';
import { FileFraction } from '~common/interfaces/blockml/internal/file-fraction';
import { FileFractionControl } from '~common/interfaces/blockml/internal/file-fraction-control';
import { FileReport } from '~common/interfaces/blockml/internal/file-report';
import { FileReportRow } from '~common/interfaces/blockml/internal/file-report-row';
import { FileReportRowParameter } from '~common/interfaces/blockml/internal/file-report-row-parameter';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { Row } from '~common/interfaces/blockml/row';
import { MyRegex } from '~common/models/my-regex';

export function makeReportFileText(item: {
  reportId: string;
  title: string;
  accessRoles: string[];
  rows: Row[];
  metrics: ModelMetric[];
  models: ModelTab[];
  struct: StructTab;
  newReportFields: ReportField[];
  chart: MconfigChart;
  timezone: string;
  caseSensitiveStringFilters: boolean;
}) {
  let {
    reportId,
    title,
    rows,
    accessRoles,
    metrics,
    models,
    struct,
    newReportFields,
    chart,
    caseSensitiveStringFilters,
    timezone
  } = item;

  let options = toFileChartOptions({
    chart: chart,
    isReport: true
  });

  let fileReport: FileReport = {
    fileName: undefined,
    fileExt: undefined,
    filePath: undefined,
    name: undefined,
    report: reportId,
    title: title,
    parameters:
      isDefined(newReportFields) && newReportFields.length > 0
        ? newReportFields.map(field => ({
            filter: field.id,
            hidden:
              isDefined(field.hidden) &&
              field.hidden !== REPORT_FIELD_DEFAULT_HIDDEN
                ? <any>field.hidden
                : undefined,
            label:
              isDefined(field.label) &&
              field.label.toUpperCase() !==
                MyRegex.replaceUnderscoresWithSpaces(field.id).toUpperCase()
                ? field.label
                : undefined,
            description:
              isDefined(field.description) && field.description !== ''
                ? field.description
                : undefined,
            result: field.result,
            store: field.storeModel,
            store_result: field.storeResult,
            store_filter: field.storeFilter,
            fractions: isUndefined(field.storeModel)
              ? undefined
              : field.fractions?.map(mconfigFraction => {
                  let fileFraction: FileFraction = {};

                  if (isDefined(mconfigFraction.logicGroup)) {
                    fileFraction.logic = mconfigFraction.logicGroup;
                  }

                  if (isDefined(mconfigFraction.storeFractionSubType)) {
                    fileFraction.type = mconfigFraction.storeFractionSubType;
                  }

                  fileFraction.controls = mconfigFraction.controls.map(
                    mconfigControl => {
                      let newFileControl: FileFractionControl = {};

                      if (
                        mconfigControl.controlClass === ControlClassEnum.Input
                      ) {
                        newFileControl.input = mconfigControl.name;
                      } else if (
                        mconfigControl.controlClass ===
                        ControlClassEnum.ListInput
                      ) {
                        newFileControl.list_input = mconfigControl.name;
                      } else if (
                        mconfigControl.controlClass === ControlClassEnum.Switch
                      ) {
                        newFileControl.switch = mconfigControl.name;
                      } else if (
                        mconfigControl.controlClass ===
                        ControlClassEnum.DatePicker
                      ) {
                        newFileControl.date_picker = mconfigControl.name;
                      } else if (
                        mconfigControl.controlClass ===
                        ControlClassEnum.Selector
                      ) {
                        newFileControl.selector = mconfigControl.name;
                      }

                      let newValue = mconfigControl.value;

                      newFileControl.value =
                        newFileControl.controlClass ===
                          ControlClassEnum.Switch &&
                        typeof newValue === 'string'
                          ? toBooleanFromLowercaseString(newValue)
                          : newValue;

                      // newFileControl.value = mconfigControl.value;

                      return newFileControl;
                    }
                  );

                  return fileFraction;
                }),
            suggest_model_dimension: field.suggestModelDimension,
            conditions:
              isUndefined(field.storeModel) &&
              isDefined(field.fractions) &&
              field.fractions.length > 0
                ? field.fractions.map(x => x.brick)
                : undefined
          }))
        : undefined,
    access_roles:
      accessRoles.length > 0 ? accessRoles.map(x => x.trim()) : undefined,
    rows: rows.map(x => {
      // console.log('x');
      // console.log(x);

      let metric =
        x.rowType === RowTypeEnum.Metric
          ? metrics.find(m => m.metricId === x.metricId)
          : undefined;

      // console.log('metric');
      // console.log(metric);

      let model = isDefined(metric)
        ? models.find(m => m.modelId === metric.modelId)
        : undefined;

      // console.log('model.modelId');
      // console.log(model?.modelId);
      // console.log('model.isStoreModel');
      // console.log(model?.isStoreModel);

      let row: FileReportRow = {
        row_id: x.rowId,
        type: x.rowType,
        name:
          x.rowType === RowTypeEnum.Empty || x.rowType === RowTypeEnum.Metric
            ? undefined
            : x.name,
        metric: x.metricId,
        formula: isDefined(x.formula) ? x.formula : undefined,
        show_chart:
          isDefined(x.showChart) &&
          x.showChart !== REPORT_ROW_DEFAULT_SHOW_CHART
            ? <any>x.showChart
            : undefined,
        format_number:
          x.rowType === RowTypeEnum.Metric &&
          metric.formatNumber === x.formatNumber
            ? undefined
            : struct.lt.mproveConfig.formatNumber === x.formatNumber
              ? undefined
              : x.formatNumber,
        currency_prefix:
          x.rowType === RowTypeEnum.Metric &&
          metric.currencyPrefix === x.currencyPrefix
            ? undefined
            : struct.lt.mproveConfig.currencyPrefix === x.currencyPrefix
              ? undefined
              : x.currencyPrefix,
        currency_suffix:
          x.rowType === RowTypeEnum.Metric &&
          metric.currencySuffix === x.currencySuffix
            ? undefined
            : struct.lt.mproveConfig.currencySuffix === x.currencySuffix
              ? undefined
              : x.currencySuffix,
        parameters:
          [RowTypeEnum.Metric].indexOf(x.rowType) < 0
            ? undefined
            : isDefined(x.parameters)
              ? x.parameters.map(parameter => {
                  let p: FileReportRowParameter = {
                    apply_to: parameter.apply_to,
                    // result: parameter.result,
                    conditions:
                      isDefined(parameter.listen) ||
                      model?.type === ModelTypeEnum.Store
                        ? // model?.isStoreModel === true
                          undefined
                        : isDefined(parameter.fractions) &&
                            parameter.fractions.length > 0
                          ? parameter.fractions.map(fraction => fraction.brick)
                          : undefined,
                    fractions:
                      model?.type === ModelTypeEnum.Store &&
                      // model?.isStoreModel === true &&
                      isUndefined(parameter.listen)
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
                                  ControlClassEnum.Input
                                ) {
                                  newFileControl.input = mconfigControl.name;
                                } else if (
                                  mconfigControl.controlClass ===
                                  ControlClassEnum.ListInput
                                ) {
                                  newFileControl.list_input =
                                    mconfigControl.name;
                                } else if (
                                  mconfigControl.controlClass ===
                                  ControlClassEnum.Switch
                                ) {
                                  newFileControl.switch = mconfigControl.name;
                                } else if (
                                  mconfigControl.controlClass ===
                                  ControlClassEnum.DatePicker
                                ) {
                                  newFileControl.date_picker =
                                    mconfigControl.name;
                                } else if (
                                  mconfigControl.controlClass ===
                                  ControlClassEnum.Selector
                                ) {
                                  newFileControl.selector = mconfigControl.name;
                                }

                                let newValue = mconfigControl.value;

                                newFileControl.value =
                                  mconfigControl.isMetricsDate === true
                                    ? model.lt.storeContent.fields
                                        .find(
                                          field =>
                                            field.fieldClass ===
                                              FieldClassEnum.Filter &&
                                            field.name === parameter.apply_to
                                        )
                                        .fraction_controls.find(
                                          control =>
                                            control.name === mconfigControl.name
                                        ).value
                                    : newFileControl.controlClass ===
                                          ControlClassEnum.Switch &&
                                        typeof newValue === 'string'
                                      ? toBooleanFromLowercaseString(newValue)
                                      : newValue;

                                return newFileControl;
                              }
                            );

                            return fileFraction;
                          })
                        : undefined,
                    listen: parameter.listen
                  };

                  return p;
                })
              : []
      };

      return row;
    }),
    options: options
  };

  let fileReportText = toYaml(fileReport);

  return fileReportText;
}
