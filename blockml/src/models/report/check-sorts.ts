import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkSorts(item: { dashboards: interfaces.Dashboard[] }) {
  item.dashboards.forEach(x => {
    let newReports: interfaces.Report[] = [];

    x.reports.forEach(report => {
      let nextReport: boolean = false;

      report.sortings_ary = [];

      if (typeof report.sorts === 'undefined' || report.sorts === null) {
        return;
      }

      report.sorts.split(',').forEach(part => {
        if (nextReport) {
          return;
        }

        let reg = ApRegex.CAPTURE_SORT_WITH_OPTIONAL_DESC_G();
        let r = reg.exec(part);

        if (r) {
          let sorter = r[1];
          let desc = r[2];

          if (!report.select_hash[sorter]) {
            // error e139
            ErrorsCollector.addError(
              new AmError({
                title: `sorting unselected field`,
                message: `field "${sorter}" of 'sorts' must be in 'select'`,
                lines: [
                  {
                    line: report.sorts_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            nextReport = true;
            return;
          } else {
            // ok
            report.sortings_ary.push({
              field_id: sorter,
              desc: desc ? 'true' : 'false'
            });
          }
        } else {
          // error e140
          ErrorsCollector.addError(
            new AmError({
              title: `wrong sorts syntax`,
              message:
                `'sorts' must contain one or more selected fields in form ` +
                `of "alias.field [desc]" separated by comma`,
              lines: [
                {
                  line: report.sorts_line_num,
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

      if (nextReport) {
        return;
      }

      newReports.push(report);
    });
  });

  return item.dashboards;
}
