import { BoolEnum } from '~common/enums/bool.enum';
import { ErEnum } from '~common/enums/er.enum';
import { ServerError } from '~common/models/server-error';

export function enumToBoolean(item: {
  value: string | BoolEnum;
  name: string;
}): boolean {
  let { value, name } = item;

  if ([BoolEnum.TRUE, BoolEnum.FALSE].indexOf(value as BoolEnum) < 0) {
    console.log('ENV_VAR_VALUE_MUST_BE_TRUE_OR_FALSE - ', name);

    throw new ServerError({
      message: ErEnum.ENV_VAR_VALUE_MUST_BE_TRUE_OR_FALSE,
      customData: {
        name: name
      }
    });
  }

  return value.toUpperCase() === BoolEnum.TRUE ? true : false;
}
