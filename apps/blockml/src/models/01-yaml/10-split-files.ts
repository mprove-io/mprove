import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.SplitFiles;

export function splitFiles(
  item: {
    filesAny: any[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let views: common.FileView[] = [];
  let models: common.FileModel[] = [];
  let stores: common.FileStore[] = [];
  let dashboards: common.FileDashboard[] = [];
  let reports: common.FileReport[] = [];
  let charts: common.FileChart[] = [];
  let udfs: common.FileUdf[] = [];
  let confs: common.FileProjectConf[] = [];

  item.filesAny.forEach(file => {
    let fileExt = file.ext;
    let fileName = file.name;
    let filePath = file.path;

    switch (file.ext) {
      case common.FileExtensionEnum.Udf: {
        if (file.name === file.udf + common.FileExtensionEnum.Udf) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newUdfOptions: common.FileUdf = {
            name: file.udf,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          udfs.push(Object.assign(file, newUdfOptions));
        } else {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_UDF_NAME,
              message: `filename ${file.name} does not match "udf: ${file.udf}"`,
              lines: [
                {
                  line: file.udf_line_num,
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
        }
        break;
      }

      case common.FileExtensionEnum.View: {
        if (file.name === file.view + common.FileExtensionEnum.View) {
          let label: string = file.label ? file.label : file.view;
          let labelLineNum: number = file.label_line_num
            ? file.label_line_num
            : 0;

          delete file.ext;
          delete file.name;
          delete file.path;

          let newViewOptions: common.FileView = {
            name: file.view,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt,
            label: label,
            label_line_num: labelLineNum
          };

          views.push(Object.assign(file, newViewOptions));
        } else {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_VIEW_NAME,
              message: `filename ${file.name} does not match "view: ${file.view}"`,
              lines: [
                {
                  line: file.view_line_num,
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
        }
        break;
      }

      case common.FileExtensionEnum.Model: {
        if (file.name === file.model + common.FileExtensionEnum.Model) {
          let label: string = file.label ? file.label : file.model;
          let labelLineNum: number = file.label_line_num
            ? file.label_line_num
            : 0;

          delete file.ext;
          delete file.name;
          delete file.path;

          let newModelOptions: common.FileModel = {
            name: file.model,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt,
            label: label,
            label_line_num: labelLineNum
          };

          models.push(Object.assign(file, newModelOptions));
        } else {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_MODEL_NAME,
              message: `filename ${file.name} does not match "model: ${file.model}"`,
              lines: [
                {
                  line: file.model_line_num,
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
        }
        break;
      }

      case common.FileExtensionEnum.Store: {
        if (file.name === file.store + common.FileExtensionEnum.Store) {
          let label: string = file.label ? file.label : file.store;
          let labelLineNum: number = file.label_line_num
            ? file.label_line_num
            : 0;

          delete file.ext;
          delete file.name;
          delete file.path;

          let newStoreOptions: common.FileStore = {
            name: file.store,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt,
            label: label,
            label_line_num: labelLineNum
          };

          stores.push(Object.assign(file, newStoreOptions));
        } else {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_STORE_NAME,
              message: `filename ${file.name} does not match "store: ${file.store}"`,
              lines: [
                {
                  line: file.store_line_num,
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
        }
        break;
      }

      case common.FileExtensionEnum.Dashboard: {
        if (file.name === file.dashboard + common.FileExtensionEnum.Dashboard) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newDashboardOptions: common.FileDashboard = {
            name: file.dashboard,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          dashboards.push(Object.assign(file, newDashboardOptions));
        } else {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_DASHBOARD_NAME,
              message: `filename ${file.name} does not match "dashboard: ${file.dashboard}"`,
              lines: [
                {
                  line: file.dashboard_line_num,
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
        }
        break;
      }

      case common.FileExtensionEnum.Report: {
        if (file.name === file.report + common.FileExtensionEnum.Report) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newRepOptions: common.FileReport = {
            name: file.report,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          reports.push(Object.assign(file, newRepOptions));
        } else {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_REPORT_NAME,
              message: `filename ${file.name} does not match "report: ${file.report}"`,
              lines: [
                {
                  line: file.tile_line_num,
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
        }
        break;
      }

      case common.FileExtensionEnum.Chart: {
        if (file.name === file.chart + common.FileExtensionEnum.Chart) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newChartOptions: common.FileChart = {
            name: file.chart,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          charts.push(Object.assign(file, newChartOptions));
        } else {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_CHART_NAME,
              message: `filename ${file.name} does not match "${common.ParameterEnum.Chart}: ${file.chart}"`,
              lines: [
                {
                  line: file.chart_line_num,
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
        }
        break;
      }

      case common.FileExtensionEnum.Yml: {
        if (file.name === common.MPROVE_CONFIG_FILENAME) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newConfOptions: common.FileProjectConf = {
            name: common.MPROVE_CONFIG_NAME,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          confs.push(Object.assign(file, newConfOptions));
        } else {
          // do nothing
        }
        break;
      }
    }
  });

  helper.log(cs, caller, func, structId, common.LogTypeEnum.Views, views);
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, models);
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Stores, stores);
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Reports, reports);
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Ds, dashboards);
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Charts, charts);
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Udfs, udfs);
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Confs, confs);
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );

  return {
    views: views,
    models: models,
    stores: stores,
    reports: reports,
    dashboards: dashboards,
    charts: charts,
    udfs: udfs,
    confs: confs
  };
}
