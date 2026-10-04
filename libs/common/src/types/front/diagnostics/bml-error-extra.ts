import type { BmlError } from '#common/types/blockml/diagnostics/bml-error';
import type { Extend } from '#common/types/extend';

export type BmlErrorExtra = Extend<
  BmlError,
  { errorExt: any; sortOrder: number }
>;
