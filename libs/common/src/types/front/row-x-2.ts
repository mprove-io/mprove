import type { ModelField } from '#common/types/blockml/parts/model-field';
import type { Row } from '#common/types/blockml/parts/row';
import type { Extend } from '#common/types/extend';

export type RowX2 = Extend<
  Row,
  {
    modelFields?: Record<string, ModelField[]>;
    mconfigListenSwap?: Record<string, string[]>;
  }
>;
