import type { ModelPart } from '#common/types/backend/parts/model-part';
import type { Extend } from '#common/types/extend';

export type ModelPartX = Extend<ModelPart, { hasAccess: boolean }>;
