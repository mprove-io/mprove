import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function splitFiles(item: { filesAny: any[] }) {
  let udfs: interfaces.Udf[] = [];
  let views: interfaces.View[] = [];
  let models: interfaces.Model[] = [];
  let dashboards: interfaces.Dashboard[] = [];

  item.filesAny.forEach(file => {
    switch (file.ext) {
      case '.udf': {
        if (file.name === file.udf + '.udf') {
          udfs.push(
            Object.assign({}, file, {
              name: file.udf,
              file: file.name
            })
          );
        } else {
          // error e210
          ErrorsCollector.addError(
            new AmError({
              title: `wrong udf name`,
              message: `filename ${file.name} does not match "udf: ${
                file.udf
              }"`,
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

      case '.view': {
        if (file.name === file.view + '.view') {
          let label: string = file.label ? file.label : file.view;
          let labelLineNum: number = file.label_line_num
            ? file.label_line_num
            : 0;

          views.push(
            Object.assign({}, file, {
              name: file.view,
              file: file.name,
              label: label,
              label_line_num: labelLineNum
            })
          );
        } else {
          // error e9
          ErrorsCollector.addError(
            new AmError({
              title: `wrong view name`,
              message: `filename ${file.name} does not match "view: ${
                file.view
              }"`,
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

      case '.model': {
        if (file.name === file.model + '.model') {
          let label: string = file.label ? file.label : file.model;
          let labelLineNum: number = file.label_line_num
            ? file.label_line_num
            : 0;

          models.push(
            Object.assign({}, file, {
              name: file.model,
              file: file.name,
              label: label,
              label_line_num: labelLineNum
            })
          );
        } else {
          // error e8
          ErrorsCollector.addError(
            new AmError({
              title: `wrong model name`,
              message: `filename ${file.name} does not match "model: ${
                file.model
              }"`,
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

      case '.dashboard': {
        if (file.name === file.dashboard + '.dashboard') {
          dashboards.push(
            Object.assign({}, file, {
              name: file.dashboard,
              file: file.name
            })
          );
        } else {
          // error e60
          ErrorsCollector.addError(
            new AmError({
              title: `wrong dashboard name`,
              message: `filename ${file.name} does not match "dashboard: ${
                file.dashboard
              }"`,
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
    }
  });

  return {
    udfs: udfs,
    views: views,
    models: models,
    dashboards: dashboards
  };
}
