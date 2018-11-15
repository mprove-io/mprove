import { enums } from '../../barrels/enums';

export function benumToBoolean(value: enums.bEnum): boolean {
  return value === enums.bEnum.TRUE
    ? true
    : value === enums.bEnum.FALSE
    ? false
    : null;
}
