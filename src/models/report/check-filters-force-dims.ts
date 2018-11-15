import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkFiltersForceDims(item: {
  dashboards: interfaces.Dashboard[];
  models: interfaces.Model[];
}) {
  item.dashboards.forEach(x => {
    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {
      let nextReport: boolean = false;

      let model = item.models.find(m => m.name === report.model);

      Object.keys(report.filters).forEach(element => {
        if (nextReport) {
          return;
        }

        let reg = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
        let r = reg.exec(element);

        // r checked

        let asName = r[1];
        let fieldName = r[2];

        let forceDims: {
          [as: string]: {
            [dim: string]: number;
          };
        } = {};

        if (asName === 'mf') {
          let modelField = model.fields.find(
            mField => mField.name === fieldName
          );

          if (modelField.field_class === enums.FieldClassEnum.Calculation) {
            forceDims = modelField.force_dims;
          }
        } else {
          // ne 'mf'

          let join = model.joins.find(j => j.as === asName);

          let viewField = join.view.fields.find(
            vField => vField.name === fieldName
          );

          if (viewField.field_class === enums.FieldClassEnum.Calculation) {
            forceDims = viewField.force_dims;
          }
        }

        Object.keys(forceDims).forEach(alias => {
          if (nextReport) {
            return;
          }

          Object.keys(forceDims[alias]).forEach(dim => {
            if (nextReport) {
              return;
            }

            let fDim = alias + '.' + dim;

            if (!report.select_hash[fDim]) {
              // error e108
              ErrorsCollector.addError(
                new AmError({
                  title: `calculation needs dimension`,
                  message: `filtering calculation "${element}" needs dimension "${fDim}" in select`,
                  lines: [
                    {
                      line: report.select_line_num,
                      name: x.file,
                      path: x.path
                    }
                  ]
                })
              );
              nextReport = true;
              return;
            }
          });
        });
      });

      if (nextReport) {
        return;
      }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}
