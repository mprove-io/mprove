import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function processListenFilters(item: {
  dashboards: interfaces.Dashboard[],
  models: interfaces.Model[]
}) {

  item.dashboards.forEach(x => {

    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {

      report.listen = {};

      let nextReport: boolean = false;

      if (!report.listen_filters) {
        newReports.push(report);
        return;
      }

      let model = item.models.find(m => m.name === report.model);

      Object.keys(report.listen_filters)
        .filter(k => !k.match(ApRegex.ENDS_WITH_LINE_NUM()))
        .forEach(filterName => {

          if (nextReport) { return; }

          let dashboardField = x.fields.find(f => f.name === filterName);

          if (!dashboardField) {
            // error e91
            ErrorsCollector.addError(new AmError({
              title: `missing dashboard filter`,
              message: `report listens dashboard's filter "${filterName}" that is missing or not valid`,
              lines: [{
                line: (<any>report.listen_filters)[filterName + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          report.listen_filters[filterName].split(',').forEach(part => {

            if (nextReport) { return; }

            let reg = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
            let r = reg.exec(part);

            if (!r) {
              // error e92
              ErrorsCollector.addError(new AmError({
                title: `wrong listener`,
                message: `Listener "${part}" is not valid. Listeners must be in form "alias_name.field_name" ` +
                  `(one or more separated by comma)`,
                lines: [{
                  line: (<any>report.listen_filters)[filterName + '_line_num'],
                  name: x.file,
                  path: x.path,
                }],
              }));
              nextReport = true;
              return;
            }

            let asName = r[1];
            let fieldName = r[2];
            let listener = `${asName}.${fieldName}`;

            if (asName === 'mf') {
              let modelField = model.fields.find(mField => mField.name === fieldName);

              if (!modelField) {
                // error e93
                ErrorsCollector.addError(new AmError({
                  title: `wrong listener model field`,
                  message:
                    `found listener "${listener}" references field "${fieldName}" that is missing or not valid ` +
                    `in fields section of model "${model.name}"`,
                  lines: [{
                    line: (<any>report.listen_filters)[filterName + '_line_num'],
                    name: x.file,
                    path: x.path,
                  }],
                }));
                nextReport = true;
                return;
              }

              if (typeof report.listen[listener] !== 'undefined' && report.listen[listener] !== null) {
                // error e94
                ErrorsCollector.addError(new AmError({
                  title: `listening more than one filter`,
                  message: `listener "${listener}" can not listen more than one filter`,
                  lines: [{
                    line: report.listen_filters_line_num,
                    name: x.file,
                    path: x.path,
                  }],
                }));
                nextReport = true;
                return;
              }

              if (dashboardField.result !== modelField.result) {
                // error e95
                ErrorsCollector.addError(new AmError({
                  title: `results do not match`,
                  message: `"${filterName}" filter result "${dashboardField.result}" does not match ` +
                    `result "${modelField.result}" of listener "${listener}"`,
                  lines: [{
                    line: (<any>report.listen_filters)[filterName + '_line_num'],
                    name: x.file,
                    path: x.path,
                  }],
                }));
                nextReport = true;
                return;
              }

              // ok
              report.listen[listener] = filterName;


            } else { // ne 'mf'

              let join = model.joins.find(j => j.as === asName);

              if (!join) {
                // error e96
                ErrorsCollector.addError(new AmError({
                  title: `wrong listener alias`,
                  message: `found listener "${listener}" references missing alias ` +
                    `"${asName}" in joins section of model "${model.name}"`,
                  lines: [{
                    line: (<any>report.listen_filters)[filterName + '_line_num'],
                    name: x.file,
                    path: x.path,
                  }],
                }));
                nextReport = true;
                return;
              }

              let viewField = join.view.fields.find(vField => vField.name === fieldName);

              if (!viewField) {
                // error e97
                ErrorsCollector.addError(new AmError({
                  title: `wrong listener view field`,
                  message: `found listener "${listener}" references missing or not valid field ` +
                    `"${fieldName}" in fields section of view "${join.view.name}" with "${asName}" alias ` +
                    `in "${model.name}" model`,
                  lines: [{
                    line: (<any>report.listen_filters)[filterName + '_line_num'],
                    name: x.file,
                    path: x.path,
                  }],
                }));
                nextReport = true;
                return;
              }

              if (typeof report.listen[listener] !== 'undefined' && report.listen[listener] !== null) {
                // error e98
                ErrorsCollector.addError(new AmError({
                  title: `listening more than one filter`,
                  message: `listener "${listener}" can not listen more than one filter`,
                  lines: [{
                    line: report.listen_filters_line_num,
                    name: x.file,
                    path: x.path,
                  }],
                }));
                nextReport = true;
                return;
              }

              if (dashboardField.result !== viewField.result) {
                // error e99
                ErrorsCollector.addError(new AmError({
                  title: `results do not match`,
                  message: `"${filterName}" filter result "${dashboardField.result}" does not match ` +
                    `result "${viewField.result}" of listener "${listener}"`,
                  lines: [{
                    line: (<any>report.listen_filters)[filterName + '_line_num'],
                    name: x.file,
                    path: x.path,
                  }],
                }));
                nextReport = true;
                return;
              }

              // ok
              report.listen[listener] = filterName;
            }
          });
        });

      if (nextReport) { return; }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}
