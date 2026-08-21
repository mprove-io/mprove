import { z } from 'zod';
import { LlmModelInactiveReasonEnum } from '#common/enums/llm-model-inactive-reason.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type LlmModelPart = {
  modelId: string;
  catalogName: string;
  providerModelInfo?: Record<string, unknown>;
  modelsDevStatus?: 'alpha' | 'beta' | 'deprecated';
  contextLimit?: number;
  inputLimit?: number;
  outputLimit?: number;
  codexContextWindow?: number;
  codexMaxContextWindow?: number;
  variants?: string[];
  isOpencodeSupported: boolean;
  explorerInactiveReasons: EnumValues<typeof LlmModelInactiveReasonEnum>[];
  builderInactiveReasons: EnumValues<typeof LlmModelInactiveReasonEnum>[];
};

export let zLlmModelPart = z
  .strictObject({
    modelId: z.string().trim().min(1),
    catalogName: z.string().trim().min(1),
    providerModelInfo: z.record(z.string(), z.unknown()).nullish(),
    modelsDevStatus: z.enum(['alpha', 'beta', 'deprecated']).nullish(),
    contextLimit: z.number().int().positive().nullish(),
    inputLimit: z.number().int().positive().nullish(),
    outputLimit: z.number().int().positive().nullish(),
    codexContextWindow: z.number().int().positive().nullish(),
    codexMaxContextWindow: z.number().int().positive().nullish(),
    variants: z.array(z.string()).nullish(),
    isOpencodeSupported: z.boolean(),
    explorerInactiveReasons: z.array(z.enum(LlmModelInactiveReasonEnum)),
    builderInactiveReasons: z.array(z.enum(LlmModelInactiveReasonEnum))
  })
  .meta({ id: 'LlmModelPart' });

assertTypesEqual<LlmModelPart, z.infer<typeof zLlmModelPart>>({ value: true });
