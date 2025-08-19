import { WrapResult } from '~common/interfaces/wrap-result';

export function errorToWrapResult<T>(error: any) {
  // console.log(error);

  let wrapResult: WrapResult<T> = {
    data: undefined,
    durationMs: 0,
    error: error,
    errorStr: error.toString()
  };

  return wrapResult;
}
