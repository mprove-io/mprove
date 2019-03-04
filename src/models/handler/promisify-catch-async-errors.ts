import * as express from 'express';
import * as util from 'util';
import { types } from '../../barrels/types';
import { ServerError } from '../server-error';

export function promisifyCatchAsyncErrors(fn: express.RequestHandler, name: types.errorsType) {

  return async (req: any, res: any, next: any) => {

    let fnAsync = util.promisify(fn);

    Promise
      .resolve(fnAsync(req, res, next))
      .catch((e: any) => {

        let nextError;

        if (e instanceof ServerError) {
          nextError = e;

        } else {

          nextError = new ServerError({
            name: name,
            originalError: e
          });
        }

        next(nextError);
      });
  };
}
