import { EXPLORER_CONTEXT_USAGE_BUFFER } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from './is-undefined';

export function getExplorerContextBlockThreshold(item: {
  contextLimit?: number;
  inputLimit?: number;
  outputLimit?: number;
}): number | undefined {
  let { contextLimit, inputLimit, outputLimit } = item;

  if (isDefined(inputLimit)) {
    let threshold: number = Math.max(
      0,
      inputLimit - EXPLORER_CONTEXT_USAGE_BUFFER
    );

    return threshold;
  }

  if (isUndefined(contextLimit)) {
    return undefined;
  }

  let usableLimit: number = Math.max(0, contextLimit - (outputLimit ?? 0));

  let threshold: number = Math.max(
    0,
    usableLimit - EXPLORER_CONTEXT_USAGE_BUFFER
  );

  return threshold;
}
