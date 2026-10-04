import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CodexInputModality,
  zCodexInputModality
} from '#common/types/backend/parts/codex/codex-input-modality';
import {
  type CodexVisibility,
  zCodexVisibility
} from '#common/types/backend/parts/codex/codex-visibility';

export type CodexModel = {
  slug: string;
  display_name: string;
  visibility: CodexVisibility;
  input_modalities?: CodexInputModality[];
  context_window?: number;
  max_context_window?: number;
  supported_reasoning_levels?: { effort: string }[];
  upgrade?: { retirement_at?: string };
};

export let zCodexModel = z
  .object({
    slug: z.string().trim().min(1),
    display_name: z.string().trim().min(1),
    visibility: zCodexVisibility,
    input_modalities: z.array(zCodexInputModality).nullish(),
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
