import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type CodexModel = {
  slug: string;
  display_name: string;
  visibility: 'list' | 'hide' | 'none';
  input_modalities?: ('text' | 'image' | 'audio')[];
  context_window?: number;
  max_context_window?: number;
  supported_reasoning_levels?: { effort: string }[];
  upgrade?: { retirement_at?: string };
};

export let zCodexModel = z
  .object({
    slug: z.string().trim().min(1),
    display_name: z.string().trim().min(1),
    visibility: z.enum(['list', 'hide', 'none']),
    input_modalities: z.array(z.enum(['text', 'image', 'audio'])).nullish(),
    context_window: z.number().int().positive().nullish(),
    max_context_window: z.number().int().positive().nullish(),
    supported_reasoning_levels: z
      .array(z.object({ effort: z.string().trim().min(1) }))
      .nullish(),
    upgrade: z
      .object({ retirement_at: z.string().trim().min(1).nullish() })
      .nullish()
  })
  .meta({ id: 'CodexModel' });

assertTypesEqual<CodexModel, z.infer<typeof zCodexModel>>({
  value: true
});
