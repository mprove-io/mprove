import { types } from '../../barrels/types';
import { ServerError } from '../../models/server-error';

export function reThrow(error: Error, name: types.errorsType) {
  if (error instanceof ServerError) {
    throw error;
  } else {
    throw new ServerError({
      name: name,
      originalError: error
    });
  }
}
