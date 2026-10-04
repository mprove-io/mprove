import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { Extend } from '#common/types/extend';

export type ModelFieldY = Extend<ModelField, { partLabel: string }>;
