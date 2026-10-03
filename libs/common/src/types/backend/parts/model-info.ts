import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ModelInfo = {
  name: string;
  connectionId: string;
  presetId?: string;
  accessRoles?: string[];
};

export let zModelInfo = z
  .object({
    name: z.string(),
    connectionId: z.string(),
    presetId: z.string().nullish(),
    accessRoles: z.array(z.string()).nullish()
  })
  .meta({ id: 'ModelInfo' });

assertTypesEqual<ModelInfo, z.infer<typeof zModelInfo>>({ value: true });
