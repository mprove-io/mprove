import { seconds } from '@nestjs/throttler';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTsLastCompleteOptionEnum } from '~common/enums/fraction/fraction-ts-last-complete-option.enum';
import { FractionTsUnitEnum } from '~common/enums/fraction/fraction-ts-unit.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { ModelTreeLevelsEnum } from '~common/enums/model-tree-levels-enum.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { Ui } from '~common/interfaces/backend/ui';
import { UTC } from './top';

export const APP_NAME_BACKEND = 'BACKEND';
export const APP_NAME_SCHEDULER = 'SCHEDULER';

export const PASSWORD_EXPIRES_OFFSET = 86400000;

export const IDEMP_EXPIRE_SECONDS = 600;

export const SKIP_JWT = 'skipJwt';

export const THROTTLE_MULTIPLIER = 3;

export const THROTTLE_CUSTOM = {
  '1s': {
    limit: 5 * THROTTLE_MULTIPLIER
  },
  '5s': {
    limit: 10 * THROTTLE_MULTIPLIER
  },
  '60s': {
    limit: 60 * THROTTLE_MULTIPLIER
  },
  '600s': {
    limit: 5 * 60 * THROTTLE_MULTIPLIER,
    blockDuration: seconds(12 * 60 * 60) // 12h
  }
};

export const THROTTLE_TELEMETRY = {
  '1s': {
    limit: 10 * THROTTLE_MULTIPLIER
  },
  '5s': {
    limit: 20 * THROTTLE_MULTIPLIER
  },
  '60s': {
    limit: 99999 * THROTTLE_MULTIPLIER
  },
  '600s': {
    limit: 99999 * THROTTLE_MULTIPLIER
  }
};

export const DEFAULT_QUERY_SIZE_LIMIT = 1;

export const UNK_ST_ID = 'unk';

export const DEFAULT_SRV_UI: Ui = {
  modelTreeLevels: ModelTreeLevelsEnum.FlatTime,
  timezone: UTC,
  timeSpec: TimeSpecEnum.Days,
  timeRangeFraction: {
    brick: 'f`last 5 days`',
    parentBrick: 'f`last 5 days`',
    operator: FractionOperatorEnum.Or,
    tsLastCompleteOption: FractionTsLastCompleteOptionEnum.CompleteWithCurrent,
    tsLastUnit: FractionTsUnitEnum.Days,
    tsLastValue: 5,
    type: FractionTypeEnum.TsIsInLast
  },
  projectFileLinks: [],
  projectModelLinks: [],
  projectChartLinks: [],
  projectDashboardLinks: [],
  projectReportLinks: []
};
