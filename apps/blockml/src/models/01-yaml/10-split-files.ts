import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.SplitFiles;

export function splitFiles(
  item: {
    filesAny: any[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let udfs: interfaces.Udf[] = [];
  let views: interfaces.View[] = [];
  let models: interfaces.Model[] = [];
  let dashboards: interfaces.Dashboard[] = [];
  let vizs: interfaces.Viz[] = [];
  let confs: interfaces.ProjectConf[] = [];

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

          let newUdfOptions: interfaces.Udf = {
            name: file.udf,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          udfs.push(Object.assign(file, newUdfOptions));
        } else {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_UDF_NAME,
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

          let newViewOptions: interfaces.View = {
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
              title: enums.ErTitleEnum.WRONG_VIEW_NAME,
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

          let newModelOptions: interfaces.Model = {
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
              title: enums.ErTitleEnum.WRONG_MODEL_NAME,
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

      case common.FileExtensionEnum.Dashboard: {
        if (file.name === file.dashboard + common.FileExtensionEnum.Dashboard) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newDashboardOptions: interfaces.Dashboard = {
            name: file.dashboard,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          dashboards.push(Object.assign(file, newDashboardOptions));
        } else {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_DASHBOARD_NAME,
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

      case common.FileExtensionEnum.Vis: {
        if (file.name === file.vis + common.FileExtensionEnum.Vis) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newVizOptions: interfaces.Viz = {
            name: file.vis,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          vizs.push(Object.assign(file, newVizOptions));
        } else {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_VIS_NAME,
              message: `filename ${file.name} does not match "${enums.ParameterEnum.Vis}: ${file.vis}"`,
              lines: [
                {
                  line: file.vis_line_num,
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

          let newConfOptions: interfaces.ProjectConf = {
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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Udfs, udfs);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Views, views);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, models);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Ds, dashboards);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Vizs, vizs);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Confs, confs);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);

  return {
    udfs: udfs,
    views: views,
    models: models,
    dashboards: dashboards,
    vizs: vizs,
    confs: confs
  };
}
