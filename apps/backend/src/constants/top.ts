import { common } from '~api-to-backend/barrels/common';

export const APP_NAME_BACKEND = 'BACKEND';
export const APP_NAME_SCHEDULER = 'SCHEDULER';

export const PASSWORD_EXPIRES_OFFSET = 86400000;
export const TIME_COLUMNS_LIMIT = 100;

export const SKIP_JWT = 'skipJwt';

export const DEFAULT_QUERY_SIZE_LIMIT = 1;

export const UNK_USER_ID = 'unk';

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
  showMetricsChart: true,
  showMetricsChartSettings: true,
  showChartForSelectedRows: true,
  showHours: false,
  showParametersJson: false,
  metricsColumnNameWidth: 450,
  metricsTimeColumnsNarrowWidth: 165,
  metricsTimeColumnsWideWidth: 220,
  modelTreeLevels: common.ModelTreeLevelsEnum.Flat
};
