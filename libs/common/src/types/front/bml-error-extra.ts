import type { BmlError } from '#common/types/blockml/parts/bml-error';
import type { Extend } from '#common/types/extend';

export type BmlErrorExtra = Extend<
  BmlError,
  { errorExt: any; sortOrder: number }
>;
