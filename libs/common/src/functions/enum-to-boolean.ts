import { BoolEnum } from '~common/enums/bool.enum';

export function enumToBoolean(value: BoolEnum): boolean {
  return value === BoolEnum.TRUE ? true : false;
}
