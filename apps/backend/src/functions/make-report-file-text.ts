import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { enums } from '~common/barrels/enums';
import { isDefined } from '~common/functions/is-defined';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { toFileChartOptions } from '~common/functions/to-file-chart-options';
import { FileFraction } from '~common/interfaces/blockml/internal/file-fraction';
import { FileFractionControl } from '~common/interfaces/blockml/internal/file-fraction-control';

export function makeReportFileText(item: {
  reportId: string;
  title: string;
  accessRoles: string[];
  accessUsers: string[];
  rows: common.Row[];
  metrics: common.ModelMetric[];
  models: schemaPostgres.ModelEnt[];
  struct: schemaPostgres.StructEnt;
  newReportFields: common.ReportField[];
  chart: common.MconfigChart;
  timezone: string;
  caseSensitiveStringFilters: boolean;
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
    chart,
    caseSensitiveStringFilters,
    timezone
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
            store: field.storeModel,
            store_result: field.storeResult,
            store_filter: field.storeFilter,
            fractions: common.isUndefined(field.storeModel)
              ? undefined
              : field.fractions?.map(mconfigFraction => {
                  let fileFraction: FileFraction = {};

                  if (common.isDefined(mconfigFraction.logicGroup)) {
                    fileFraction.logic = mconfigFraction.logicGroup;
                  }

                  if (common.isDefined(mconfigFraction.storeFractionSubType)) {
                    fileFraction.type = mconfigFraction.storeFractionSubType;
                  }

                  fileFraction.controls = mconfigFraction.controls.map(
                    mconfigControl => {
                      let newFileControl: common.FileFractionControl = {};

                      if (
                        mconfigControl.controlClass ===
                        enums.ControlClassEnum.Input
                      ) {
                        newFileControl.input = mconfigControl.name;
                      } else if (
                        mconfigControl.controlClass ===
                        enums.ControlClassEnum.ListInput
                      ) {
                        newFileControl.list_input = mconfigControl.name;
                      } else if (
                        mconfigControl.controlClass ===
                        enums.ControlClassEnum.Switch
                      ) {
                        newFileControl.switch = mconfigControl.name;
                      } else if (
                        mconfigControl.controlClass ===
                        enums.ControlClassEnum.DatePicker
                      ) {
                        newFileControl.date_picker = mconfigControl.name;
                      } else if (
                        mconfigControl.controlClass ===
                        enums.ControlClassEnum.Selector
                      ) {
                        newFileControl.selector = mconfigControl.name;
                      }

                      let newValue = mconfigControl.value;

                      // let reg = common.MyRegex.CAPTURE_S_REF();

                      // let r;

                      // // let refError;

                      // while ((r = reg.exec(newValue))) {
                      //   let reference = r[1];

                      //   let target: any;

                      //   if (reference === 'METRICS_DATE_FROM') {
                      //     target = getYYYYMMDDCurrentDateByTimezone({
                      //       timezone: timezone,
                      //       deltaDays: -1
                      //     });
                      //   } else if (reference === 'METRICS_DATE_TO') {
                      //     target = getYYYYMMDDCurrentDateByTimezone({
                      //       timezone: timezone,
                      //       deltaDays: +1
                      //     });
                      //   } else if (reference === 'DATE_TODAY') {
                      //     target = getYYYYMMDDCurrentDateByTimezone({
                      //       timezone: timezone,
                      //       deltaDays: 0
                      //     });
                      //   } else if (
                      //     reference === 'PROJECT_CONFIG_CASE_SENSITIVE'
                      //   ) {
                      //     target = caseSensitiveStringFilters;
                      //     // } else if (reference === 'ENV_GA_PROPERTY_ID_1') { // TODO:
                      //     //   target = '...';
                      //   } else {
                      //     target = null;
                      //     // refError = `Unknown reference in store.${storeParam}: $${reference}`;
                      //     // break;
                      //   }

                      // newValue = common.MyRegex.replaceSRefs(
                      //   newValue,
                      //   reference,
                      //   target
                      // );
                      // }

                      newFileControl.value =
                        newFileControl.controlClass ===
                          common.ControlClassEnum.Switch &&
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
              common.isUndefined(field.storeModel) &&
              common.isDefined(field.fractions) &&
              field.fractions.length > 0
                ? field.fractions.map(x => x.brick)
                : undefined
          }))
        : undefined,
    access_roles:
      accessRoles.length > 0 ? accessRoles.map(x => x.trim()) : undefined,
    access_users:
      accessUsers.length > 0 ? accessUsers.map(x => x.trim()) : undefined,
    rows: rows.map(x => {
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
        parameters:
          [common.RowTypeEnum.Metric].indexOf(x.rowType) < 0
            ? undefined
            : common.isDefined(x.parameters)
            ? x.parameters.map(parameter => {
                let p: common.FileReportRowParameter = {
                  apply_to: parameter.apply_to,
                  // result: parameter.result,
                  conditions:
                    common.isDefined(parameter.listen) ||
                    model?.isStoreModel === true
                      ? undefined
                      : common.isDefined(parameter.fractions) &&
                        parameter.fractions.length > 0
                      ? parameter.fractions.map(fraction => fraction.brick)
                      : undefined,
                  fractions:
                    model?.isStoreModel === true &&
                    common.isUndefined(parameter.listen)
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
                                newFileControl.list_input = mconfigControl.name;
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

                              let newValue = mconfigControl.value;

                              newFileControl.value =
                                mconfigControl.isMetricsDate === true
                                  ? (model.content as common.FileStore).fields
                                      .find(
                                        field =>
                                          field.fieldClass ===
                                            common.FieldClassEnum.Filter &&
                                          field.name === parameter.apply_to
                                      )
                                      .fraction_controls.find(
                                        control =>
                                          control.name === mconfigControl.name
                                      ).value
                                  : newFileControl.controlClass ===
                                      common.ControlClassEnum.Switch &&
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

  let fileReportText = common.toYaml(fileReport);

  return fileReportText;
}
