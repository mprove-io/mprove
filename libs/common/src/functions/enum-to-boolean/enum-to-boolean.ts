import { ServerError } from '#common/classes/server-error/server-error';
import { type Bool, boolValues } from '#common/types/shared/bool';

export function enumToBoolean(item: {
  value: string | Bool;
  name: string;
}): boolean {
  let { value, name } = item;

  if (boolValues.findIndex(candidate => candidate === value) < 0) {
    console.log('ENV_VAR_VALUE_MUST_BE_TRUE_OR_FALSE - ', name);

    throw new ServerError({
      message: 'ENV_VAR_VALUE_MUST_BE_TRUE_OR_FALSE',
      customData: {
        name: name
      }
    });
  }

  return value.toUpperCase() === ('TRUE' satisfies Bool) ? true : false;
}
