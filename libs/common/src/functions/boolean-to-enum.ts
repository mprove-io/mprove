import { BoolEnum } from '~common/enums/bool.enum';

export function booleanToEnum(value: boolean): BoolEnum {
  return value === true ? BoolEnum.TRUE : BoolEnum.FALSE;
}
