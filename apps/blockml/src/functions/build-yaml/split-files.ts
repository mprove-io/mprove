import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.SplitFiles;

export function splitFiles(
  item: {
    filesAny: any[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let mods: FileMod[] = [];
  let stores: FileStore[] = [];
  let dashboards: FileDashboard[] = [];
  let reports: FileReport[] = [];
  let charts: FileChart[] = [];
  let confs: FileProjectConf[] = [];

  item.filesAny.forEach(file => {
    let fileExt = file.ext;
    let fileName = file.name;
    let filePath = file.path;

    switch (file.ext) {
      case FileExtensionEnum.Store: {
        if (file.name === file.store + FileExtensionEnum.Store) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newStoreOptions: FileStore = {
            name: file.store,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt,
            label:
              file.label ??
              file.store
                .split('_')
                .map((word: string) => capitalizeFirstLetter(word))
                .join(' '),
            label_line_num: file.label_line_num ?? 0
          };

          stores.push(Object.assign(file, newStoreOptions));
        } else {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_STORE_NAME,
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

      case FileExtensionEnum.Dashboard: {
        if (file.name === file.dashboard + FileExtensionEnum.Dashboard) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newDashboardOptions: FileDashboard = {
            name: file.dashboard,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          dashboards.push(Object.assign(file, newDashboardOptions));
        } else {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_DASHBOARD_NAME,
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

      case FileExtensionEnum.Report: {
        if (file.name === file.report + FileExtensionEnum.Report) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newRepOptions: FileReport = {
            name: file.report,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          reports.push(Object.assign(file, newRepOptions));
        } else {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_REPORT_NAME,
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

      case FileExtensionEnum.Chart: {
        if (file.name === file.chart + FileExtensionEnum.Chart) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newChartOptions: FileChart = {
            name: file.chart,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          charts.push(Object.assign(file, newChartOptions));
        } else {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_CHART_NAME,
              message: `filename ${file.name} does not match "${ParameterEnum.Chart}: ${file.chart}"`,
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

      case FileExtensionEnum.Yml: {
        if (file.name === MPROVE_CONFIG_FILENAME) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newConfOptions: FileProjectConf = {
            name: MPROVE_CONFIG_NAME,
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

  log(cs, caller, func, structId, LogTypeEnum.Mods, mods);
  log(cs, caller, func, structId, LogTypeEnum.Stores, stores);
  log(cs, caller, func, structId, LogTypeEnum.Reports, reports);
  log(cs, caller, func, structId, LogTypeEnum.Ds, dashboards);
  log(cs, caller, func, structId, LogTypeEnum.Charts, charts);
  log(cs, caller, func, structId, LogTypeEnum.Confs, confs);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return {
    mods: mods,
    stores: stores,
    reports: reports,
    dashboards: dashboards,
    charts: charts,
    confs: confs
  };
}
