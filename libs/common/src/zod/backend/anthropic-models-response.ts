import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type AnthropicModel,
  zAnthropicModel
} from '#common/zod/backend/anthropic-model';

export type AnthropicModelsResponse = {
  [key: string]: unknown;
  data: AnthropicModel[];
  first_id?: string;
  has_more: boolean;
  last_id?: string;
};

export let zAnthropicModelsResponse = z
  .looseObject({
    data: z.array(zAnthropicModel),
    first_id: z.string().nullish(),
    has_more: z.boolean(),
    last_id: z.string().nullish()
  })
  .meta({ id: 'AnthropicModelsResponse' });

assertTypesEqual<
  AnthropicModelsResponse,
  z.infer<typeof zAnthropicModelsResponse>
>({ value: true });
