import { common } from '~api-to-backend/barrels/common';

export const APP_NAME_BACKEND = 'BACKEND';
export const APP_NAME_SCHEDULER = 'SCHEDULER';

export const PASSWORD_EXPIRES_OFFSET = 86400000;

export const IDEMP_EXPIRE_SECONDS = 600;

export const SKIP_JWT = 'skipJwt';

export const DEFAULT_QUERY_SIZE_LIMIT = 1;

export const UNK_ST_ID = 'unk';

export const DEFAULT_UI: common.Ui = {
  timezone: common.UTC,
  timeSpec: common.TimeSpecEnum.Days,
  timeRangeFraction: {
    brick: 'last 5 days',
    operator: common.FractionOperatorEnum.Or,
    tsLastCompleteOption:
      common.FractionTsLastCompleteOptionEnum.CompletePlusCurrent,
    tsLastUnit: common.FractionTsLastUnitEnum.Days,
    tsLastValue: 5,
    type: common.FractionTypeEnum.TsIsInLast
  },
  showMetricsModelName: false,
  showMetricsTimeFieldName: false,
  showMetricsParameters: true,
  showMetricsChart: true,
  showMetricsChartSettings: true,
  showHours: false,
  projectReportLinks: [],
  projectDashboardLinks: [],
  metricsColumnNameWidth: 570,
  metricsTimeColumnsNarrowWidth: 165,
  metricsTimeColumnsWideWidth: 220,
  modelTreeLevels: common.ModelTreeLevelsEnum.Flat
};
