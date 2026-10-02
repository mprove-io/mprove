import type { WrapResult } from '#common/types/wrap-result';

export function errorToWrapResult<T>(error: any) {
  let wrapResult: WrapResult<T> = {
    data: undefined,
    durationMs: 0,
    error: error,
    errorStr: error.toString()
  };

  return wrapResult;
}
