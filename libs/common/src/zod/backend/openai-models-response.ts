import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type OpenAiModel,
  zOpenAiModel
} from '#common/zod/backend/openai-model';

export type OpenAiModelsResponse = {
  [key: string]: unknown;
  data: OpenAiModel[];
  object: 'list';
};

export let zOpenAiModelsResponse = z
  .looseObject({
    data: z.array(zOpenAiModel),
    object: z.literal('list')
  })
  .meta({ id: 'OpenAiModelsResponse' });

assertTypesEqual<OpenAiModelsResponse, z.infer<typeof zOpenAiModelsResponse>>({
  value: true
});
