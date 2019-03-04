import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { api } from '../../barrels/api';
import { barProcessFilter } from '../../barrels/bar-process-filter';
import { interfaces } from '../../barrels/interfaces';

export function checkReportDefaultFilters(item: {
  dashboards: interfaces.Dashboard[],
  models: interfaces.Model[],
  weekStart: api.ProjectWeekStartEnum
}) {

  item.dashboards.forEach(x => {

    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {

      let nextReport: boolean = false;

      report.default = {};
      report.filters = {};

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

          // r already checked

          let asName = r[1];
          let fieldName = r[2];

          let result = asName === 'mf'
            ? model.fields.find(mField => mField.name === fieldName).result
            : model.joins.find(j => j.as === asName).view.fields.find(vField => vField.name === fieldName).result;

          if (!Array.isArray(report.default_filters[defaultFilter])) {
            // error e106
            ErrorsCollector.addError(new AmError({
              title: `report default filter must be a List`,
              message: `each key of 'default_filters' must have element(s) inside like:
- "filter expression"
- "filter expression"
- ...`,
              lines: [{
                line: (<any>report.default_filters)[defaultFilter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          let p = barProcessFilter.processFilter({
            result: result,
            filter_bricks: report.default_filters[defaultFilter],
            proc: 'proc',
            weekStart: item.weekStart,
            timezone: report.timezone,
            sqlTimestampSelect: 'sql_timestamp_select',
            ORs: [],
            NOTs: [],
            IN: [],
            NOTIN: [],
            fractions: []
          });

          if (p.valid === 0) {
            // error e107
            ErrorsCollector.addError(new AmError({
              title: `wrong filter expression`,
              message: `found expression "${p.brick}" for result "${result}" of filter "${defaultFilter}"`,
              lines: [{
                line: (<any>report.default_filters)[defaultFilter + '_line_num'],
                name: x.file,
                path: x.path,
              }],
            }));
            nextReport = true;
            return;
          }

          report.default[defaultFilter] = JSON.parse(JSON.stringify(report.default_filters[defaultFilter]));
          report.filters[defaultFilter] = JSON.parse(JSON.stringify(report.default_filters[defaultFilter]));

        });

      if (nextReport) { return; }

      newReports.push(report);
    });

    x.reports = newReports;
  });

  return item.dashboards;
}
