import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function processDefaultFilters(item: {
  dashboards: interfaces.Dashboard[],
  models: interfaces.Model[]
}) {

  item.dashboards.forEach(x => {

    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {

      let nextReport: boolean = false;

      if (!report.default_filters) {
        newReports.push(report);
        return;
      }

      let model = item.models.find(m => m.name === report.model);

      Object.keys(report.default_filters)
        .filter(k => !k.match(ApRegex.ENDS_WITH_LINE_NUM()))
        .forEach(defaultFilter => {

          if (nextReport) { return; }

          let reg = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
          let r = reg.exec(defaultFilter);

          if (!r) {
            // error e266
            ErrorsCollector.addError(new AmError({
              title: `wrong default filter reference`,
              message: `default filter must be in form "alias_name.field_name:"`,
              lines: [{
                line: (<any>report.default_filters)[defaultFilter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          let asName = r[1];
          let fieldName = r[2];

          if (asName === 'mf') {
            let modelField = model.fields.find(mField => mField.name === fieldName);

            if (!modelField) {
              // error e100
              ErrorsCollector.addError(new AmError({
                title: `missing model field`,
                message: `found default filter "${defaultFilter}" references field "${fieldName}" that is missing ` +
                  `or not valid in fields section of model "${model.name}"`,
                lines: [{
                  line: (<any>report.default_filters)[defaultFilter + '_line_num'],
                  name: x.file,
                  path: x.path,
                }],
              }));
              nextReport = true;
              return;
            }

          } else { // ne 'mf'

            let join = model.joins.find(j => j.as === asName);

            if (!join) {
              // error e101
              ErrorsCollector.addError(new AmError({
                title: `wrong alias`,
                message: `found default filter "${defaultFilter}" references missing alias ` +
                  `"${asName}" in joins section of model "${model.name}"`,
                lines: [{
                  line: (<any>report.default_filters)[defaultFilter + '_line_num'],
                  name: x.file,
                  path: x.path,
                }],
              }));
              nextReport = true;
              return;
            }

            let viewField = join.view.fields.find(vField => vField.name === fieldName);

            if (!viewField) {
              // error e102
              ErrorsCollector.addError(new AmError({
                title: `missing view field`,
                message: `found default filter "${defaultFilter}" references field "${fieldName}" that is missing ` +
                  `or not valid in fields section of view "${join.view.name}" with "${asName}" alias ` +
                  `in "${model.name}" model`,
                lines: [{
                  line: (<any>report.default_filters)[defaultFilter + '_line_num'],
                  name: x.file,
                  path: x.path,
                }],
              }));
              nextReport = true;
              return;
            }

            if (report.listen[defaultFilter]) {
              // error e103
              ErrorsCollector.addError(new AmError({
                title: `same field in default and listen filters`,
                message: `found "${defaultFilter}" in default and listen filters at the same time`,
                lines: [{
                  line: (<any>report.default_filters)[defaultFilter + '_line_num'],
                  name: x.file,
                  path: x.path,
                }],
              }));
              nextReport = true;
              return;
            }
          }
        });

      if (nextReport) { return; }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}
