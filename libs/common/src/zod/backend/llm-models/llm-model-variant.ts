import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type LlmModelVariant = {
  variant: string;
  isExplorer: boolean;
  isBuilder: boolean;
  isExplorerRecommended: boolean;
  isBuilderRecommended: boolean;
};

export let zLlmModelVariant = z
  .strictObject({
    variant: z.string().trim().min(1),
    isExplorer: z.boolean(),
    isBuilder: z.boolean(),
    isExplorerRecommended: z.boolean(),
    isBuilderRecommended: z.boolean()
  })
  .meta({ id: 'LlmModelVariant' });

assertTypesEqual<LlmModelVariant, z.infer<typeof zLlmModelVariant>>({
  value: true
});
