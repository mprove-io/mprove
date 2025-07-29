import { common } from '~api-to-backend/barrels/common';

export const APP_NAME_BACKEND = 'BACKEND';
export const APP_NAME_SCHEDULER = 'SCHEDULER';

export const PASSWORD_EXPIRES_OFFSET = 86400000;

export const IDEMP_EXPIRE_SECONDS = 600;

export const SKIP_JWT = 'skipJwt';

export const DEFAULT_QUERY_SIZE_LIMIT = 1;

export const UNK_ST_ID = 'unk';

export const DEFAULT_SRV_UI: common.Ui = {
  modelTreeLevels: common.ModelTreeLevelsEnum.Flat,
  timezone: common.UTC,
  timeSpec: common.TimeSpecEnum.Days,
  timeRangeFraction: {
    brick: 'last 5 days',
    operator: common.FractionOperatorEnum.Or,
    tsLastCompleteOption:
      common.FractionTsLastCompleteOptionEnum.CompletePlusCurrent,
    tsLastUnit: common.FractionTsUnitEnum.Days,
    tsLastValue: 5,
    type: common.FractionTypeEnum.TsIsInLast
  },
  projectFileLinks: [],
  projectModelLinks: [],
  projectChartLinks: [],
  projectDashboardLinks: [],
  projectReportLinks: []
};
