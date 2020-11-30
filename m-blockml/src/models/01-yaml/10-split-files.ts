import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { api } from '../../barrels/api';

let func = enums.FuncEnum.SplitFiles;

export function splitFiles(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let udfs: interfaces.Udf[] = [];
  let views: interfaces.View[] = [];
  let models: interfaces.Model[] = [];
  let dashboards: interfaces.Dashboard[] = [];
  let visualizations: interfaces.Visualization[] = [];

  item.filesAny.forEach(file => {
    let fileExt = file.ext;
    let fileName = file.name;
    let filePath = file.path;

    switch (file.ext) {
      case api.FileExtensionEnum.Udf: {
        if (file.name === file.udf + api.FileExtensionEnum.Udf) {
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

      case api.FileExtensionEnum.View: {
        if (file.name === file.view + api.FileExtensionEnum.View) {
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

      case api.FileExtensionEnum.Model: {
        if (file.name === file.model + api.FileExtensionEnum.Model) {
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

      case api.FileExtensionEnum.Dashboard: {
        if (file.name === file.dashboard + api.FileExtensionEnum.Dashboard) {
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

      case api.FileExtensionEnum.Visualization: {
        if (
          file.name ===
          file.visualization + api.FileExtensionEnum.Visualization
        ) {
          delete file.ext;
          delete file.name;
          delete file.path;

          let newVisualizationOptions: interfaces.Visualization = {
            name: file.visualization,
            fileName: fileName,
            filePath: filePath,
            fileExt: fileExt
          };

          visualizations.push(Object.assign(file, newVisualizationOptions));
        } else {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_VISUALIZATION_NAME,
              message: `filename ${file.name} does not match "visualization: ${file.visualization}"`,
              lines: [
                {
                  line: file.visualization_line_num,
                  name: file.name,
                  path: file.path
                }
              ]
            })
          );
        }
        break;
      }
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Udfs, udfs);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, views);
  helper.log(caller, func, structId, enums.LogTypeEnum.Models, models);
  helper.log(caller, func, structId, enums.LogTypeEnum.Dashboards, dashboards);
  helper.log(caller, func, structId, enums.LogTypeEnum.Vis, visualizations);
  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);

  return {
    udfs: udfs,
    views: views,
    models: models,
    dashboards: dashboards,
    visualizations: visualizations
  };
}
