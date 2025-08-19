import { WrapResult } from '~common/interfaces/wrap-result';

export async function getWrapResult<T>(item: {
  promise: Promise<T>;
}) {
  let startMs = Date.now();

  let resp = await item.promise;

  let durationMs = Date.now() - startMs;

  let result: WrapResult<T> = {
    durationMs: durationMs,
    data: resp,
    error: undefined,
    errorStr: undefined
  };

  return result;
}
