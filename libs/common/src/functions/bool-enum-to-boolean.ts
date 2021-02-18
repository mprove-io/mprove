import { enums } from '~common/barrels/enums';

export function boolEnumToBoolean(value: enums.BoolEnum): boolean {
  return value === enums.BoolEnum.TRUE
    ? true
    : value === enums.BoolEnum.FALSE
    ? false
    : null;
}
