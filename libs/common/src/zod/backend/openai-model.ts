import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type OpenAiModel = {
  [key: string]: unknown;
  id: string;
  created: number;
  object: 'model';
  owned_by: string;
  shutdown_date?: string;
};

export let zOpenAiModel = z
  .looseObject({
    id: z.string().trim().min(1),
    created: z.number().int(),
    object: z.literal('model'),
    owned_by: z.string(),
    shutdown_date: z.string().nullish()
  })
  .meta({ id: 'OpenAiModel' });

assertTypesEqual<OpenAiModel, z.infer<typeof zOpenAiModel>>({
  value: true
});
