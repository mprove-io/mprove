import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { StructService } from '../services/struct.service';
import { BaseQuery } from './base.query';

export class TimeState {
  timezone: string;
  timeSpec: common.TimeSpecEnum;
  timeRangeFraction: common.Fraction;
}

let timeState: TimeState = {
  timezone: undefined,
  timeSpec: undefined,
  timeRangeFraction: undefined
};

@Injectable({ providedIn: 'root' })
export class TimeQuery extends BaseQuery<TimeState> {
  constructor(structService: StructService) {
    timeState.timezone =
      localStorage.getItem(constants.LOCAL_STORAGE_TIMEZONE) ||
      structService.getTimezone();

    timeState.timeSpec =
      (localStorage.getItem(
        constants.LOCAL_STORAGE_TIME_SPEC
      ) as common.TimeSpecEnum) || constants.DEFAULT_TIME_SPEC;

    let timeRangeFractionStr = localStorage.getItem(
      constants.LOCAL_STORAGE_TIME_RANGE_FRACTION
    );

    timeState.timeRangeFraction = common.isDefined(timeRangeFractionStr)
      ? JSON.parse(timeRangeFractionStr)
      : constants.DEFAULT_TIME_RANGE_FRACTION;

    super(createStore({ name: 'time' }, withProps<TimeState>(timeState)));
  }
}
