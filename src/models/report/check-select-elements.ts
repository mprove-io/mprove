import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkSelectElements(item: {
  dashboards: interfaces.Dashboard[],
  models: interfaces.Model[]
}) {

  item.dashboards.forEach(x => {

    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {

      let nextReport: boolean = false;

      report.select_hash = {};

      report.select.forEach(element => {

        if (nextReport) { return; }

        let model = item.models.find(m => m.name === report.model);

        let reg = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
        let r = reg.exec(element);

        if (r) {
          let asName = r[1];
          let fieldName = r[2];

          if (asName === 'mf') {

            let modelField = model.fields.find(mField => mField.name === fieldName);

            if (!modelField) {
              // error e87
              ErrorsCollector.addError(new AmError({
                title: `wrong select field`,
                message: `found element "- ${element}" references missing or not valid field ` +
                  `"${fieldName}" in fields section of model "${model.name}"`,
                lines: [{
                  line: report.select_line_num,
                  name: x.file,
                  path: x.path,
                }],
              }));
              nextReport = true;
              return;
            }

            if (!report.select_hash[element]) {
              report.select_hash[element] = {};
            }

            if (modelField.field_class === enums.FieldClassEnum.Calculation) {
              Object.keys(modelField.force_dims).forEach(alias => {
                Object.keys(modelField.force_dims[alias]).forEach(dim => {
                  let forceDim = alias + '.' + dim;

                  report.select_hash[element][forceDim] = 1;
                });
              });
            }

          } else {
            let join = model.joins.find(j => j.as === asName);

            if (!join) {
              // error e88
              ErrorsCollector.addError(new AmError({
                title: `wrong select alias`,
                message: `found element "- ${element}" references missing alias ` +
                  `"${asName}" in joins section of model "${model.name}"`,
                lines: [{
                  line: report.select_line_num,
                  name: x.file,
                  path: x.path,
                }],
              }));
              nextReport = true;
              return;
            }

            let viewField = join.view.fields.find(vField => vField.name === fieldName);

            if (!viewField) {
              // error e89
              ErrorsCollector.addError(new AmError({
                title: `wrong select field`,
                message: `found element "- ${element}" references missing or not valid field ` +
                  `"${fieldName}" in fields section of view "${join.view.name}" with "${asName}" alias ` +
                  `in "${model.name}" model`,
                lines: [{
                  line: report.select_line_num,
                  name: x.file,
                  path: x.path,
                }],
              }));
              nextReport = true;
              return;
            }

            if (!report.select_hash[element]) {
              report.select_hash[element] = {};
            }

            if (viewField.field_class === enums.FieldClassEnum.Calculation) {
              Object.keys(viewField.force_dims).forEach(alias => {
                Object.keys(viewField.force_dims[alias]).forEach(dim => {
                  let forceDim = alias + '.' + dim;

                  report.select_hash[element][forceDim] = 1;
                });
              });
            }

          }

        } else {
          // error e265
          ErrorsCollector.addError(new AmError({
            title: `wrong select element`,
            message: `found element "- ${element}" that can not be parsed as "alias.field_name"`,
            lines: [{
              line: report.select_line_num,
              name: x.file,
              path: x.path,
            }],
          }));
          nextReport = true;
          return;
        }

      });

      if (nextReport) { return; }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}
