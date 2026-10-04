import type { ModelNode } from '#common/types/blockml/parts/model/model-node';
import type { Extend } from '#common/types/extend';

export type ModelNodeExtra = Extend<
  ModelNode,
  {
    isSelected: boolean;
    isFiltered: boolean;
    children?: ModelNodeExtra[];
    joinLabel?: string;
    timeLabel?: string;
  }
>;
