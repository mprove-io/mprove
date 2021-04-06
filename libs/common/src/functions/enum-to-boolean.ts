import { enums } from '~common/barrels/enums';

export function enumToBoolean(value: enums.BoolEnum): boolean {
  return value === enums.BoolEnum.TRUE ? true : false;
}
