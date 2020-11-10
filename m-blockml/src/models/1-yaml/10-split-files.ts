import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { api } from '../../barrels/api';

let logPack = '1-yaml';
let logFolder = '10-split-files';

export function splitFiles(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
}) {
  let logId = item.structId;
  helper.log(logId, logPack, logFolder, enums.LogEnum.Input, item);

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

          udfs.push(
            Object.assign({}, file, {
              name: file.udf,
              fileName: fileName,
              filePath: filePath,
              fileExt: fileExt
            })
          );
        } else {
          // error e210
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

          views.push(
            Object.assign({}, file, {
              name: file.view,
              fileName: fileName,
              filePath: filePath,
              fileExt: fileExt,
              label: label,
              label_line_num: labelLineNum
            })
          );
        } else {
          // error e9
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

          models.push(
            Object.assign({}, file, {
              name: file.model,
              fileName: fileName,
              filePath: filePath,
              fileExt: fileExt,
              label: label,
              label_line_num: labelLineNum
            })
          );
        } else {
          // error e8
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

          dashboards.push(
            Object.assign({}, file, {
              name: file.dashboard,
              fileName: fileName,
              filePath: filePath,
              fileExt: fileExt
            })
          );
        } else {
          // error e60
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

          visualizations.push(
            Object.assign({}, file, {
              name: file.visualization,
              fileName: fileName,
              filePath: filePath,
              fileExt: fileExt
            })
          );
        } else {
          // error
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

  helper.log(logId, logPack, logFolder, enums.LogEnum.Udfs, udfs);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Views, views);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Models, models);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Dashboards, dashboards);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Vis, visualizations);
  helper.log(logId, logPack, logFolder, enums.LogEnum.Errors, item.errors);

  return {
    udfs: udfs,
    views: views,
    models: models,
    dashboards: dashboards,
    visualizations: visualizations
  };
}
