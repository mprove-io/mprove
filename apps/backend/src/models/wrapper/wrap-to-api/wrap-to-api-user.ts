import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { entities } from '~backend/barrels/entities';

export function wrapToApiUser(user: entities.UserEntity): common.User {
  return {
    userId: user.user_id,
    email: user.email,
    alias: user.alias,
    firstName: user.first_name,
    lastName: user.last_name,
    timezone: user.timezone,
    isEmailVerified: common.enumToBoolean(user.is_email_verified),
    ui: {
      timezone: user.ui?.timezone || constants.DEFAULT_UI.timezone,
      timeSpec: user.ui?.timeSpec || constants.DEFAULT_UI.timeSpec,
      timeRangeFraction:
        user.ui?.timeRangeFraction || constants.DEFAULT_UI.timeRangeFraction,
      showMetricsChart: common.isDefined(user.ui?.showMetricsChart)
        ? user.ui?.showMetricsChart
        : constants.DEFAULT_UI.showMetricsChart,
      showMetricsChartSettings: common.isDefined(
        user.ui?.showMetricsChartSettings
      )
        ? user.ui?.showMetricsChartSettings
        : constants.DEFAULT_UI.showMetricsChartSettings,
      showChartForSelectedRow: common.isDefined(
        user.ui?.showChartForSelectedRow
      )
        ? user.ui?.showChartForSelectedRow
        : constants.DEFAULT_UI.showChartForSelectedRow
    },
    serverTs: Number(user.server_ts)
  };
}
