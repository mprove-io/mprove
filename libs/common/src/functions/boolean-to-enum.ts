import { enums } from '~common/barrels/enums';

export function booleanToEnum(value: boolean): enums.BoolEnum {
  return value === true
    ? enums.BoolEnum.TRUE
    : value === false
    ? enums.BoolEnum.FALSE
    : null;
}
