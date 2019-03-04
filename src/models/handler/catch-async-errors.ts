import { types } from '../../barrels/types';
import { ServerError } from '../server-error';

export function catchAsyncErrors(fnAsync: any, name: types.errorsType) {

  return async (req: any, res: any, next: any) => {

    // await // TODO: check need of await
    fnAsync(req, res, next)
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

// export function handlerCatchAsyncErrors(fnAsync: any) {

//   return async (req: any, res: any, next: any) => {

//     try {
//       await fnAsync(req, res, next);

//     } catch (err) {
//       next(err);
//     }
//   };
// }
