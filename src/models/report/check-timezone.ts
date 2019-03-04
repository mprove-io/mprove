import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';

export function checkTimezone(item: {
  dashboards: interfaces.Dashboard[]
}) {

  let timezonesHash: { [tzValue: string]: number } = {};

  api.timezones.forEach(group => {
    group.zones.forEach(tz => {
      timezonesHash[tz.value] = 1;
    });
  });

  item.dashboards.forEach(x => {

    x.reports.forEach(report => {

      if (!report.timezone) {
        report.timezone = 'UTC';
        return;
      }

      if (Object.keys(timezonesHash).indexOf(report.timezone) < 0) {
        // error e218
        ErrorsCollector.addError(new AmError({
          title: `wrong 'timezone' value`,
          message: `'timezone' must one of Mprove Timezone Selector's values`,
          lines: [{
            line: report.timezone_line_num,
            name: x.file,
            path: x.path,
          }],
        }));

        report.timezone = 'UTC';
        return;
      }

    });
  });

  return item.dashboards;
}
