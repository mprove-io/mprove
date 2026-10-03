import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ModelPart,
  zModelPart
} from '#common/types/backend/parts/model-part';
import type { Extend } from '#common/types/extend';

export type ModelPartX = Extend<ModelPart, { hasAccess: boolean }>;

export let zModelPartX = zModelPart
  .extend({
    hasAccess: z.boolean()
  })
  .meta({ id: 'ModelPartX' });

assertTypesEqual<ModelPartX, z.infer<typeof zModelPartX>>({ value: true });
