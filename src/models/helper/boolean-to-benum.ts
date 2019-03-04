import { enums } from '../../barrels/enums';

export function booleanToBenum(value: boolean): enums.bEnum {

  return value === true ? enums.bEnum.TRUE
    : value === false ? enums.bEnum.FALSE : null;
}
