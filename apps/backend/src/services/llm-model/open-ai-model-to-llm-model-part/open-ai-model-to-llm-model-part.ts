import type { Model, Provider } from '@opencode-ai/models';
import type OpenAI from 'openai';
import { getOpenAiReasoningEfforts } from '#backend/functions/llm-providers/openai/get-open-ai-reasoning-efforts/get-open-ai-reasoning-efforts';
import type { LlmModelPart } from '#common/types/backend/parts/llm-models/llm-model-part';
export function openAiModelToLlmModelPart(item: {
  devModel: Model;
  devProvider: Provider;
  openAiModel?: OpenAI.Models.Model;
}): LlmModelPart | undefined {
  let { devModel, devProvider, openAiModel } = item;
  if (openAiModel === undefined) {
    return undefined;
  }
  let hasTextInput: boolean =
    devModel.modalities?.input.includes('text') ?? false;
  let hasTextOutput: boolean =
    devModel.modalities?.output.includes('text') ?? false;
  let hasRequiredToolSupport: boolean =
    devModel.tool_call || devModel.id === 'gpt-5-chat-latest';
  if (!hasTextInput || !hasTextOutput || !hasRequiredToolSupport) {
    return undefined;
  }
  let variants: string[] = [];
  if (devModel.reasoning) {
    let effortOption = devModel.reasoning_options?.find(
      option => option.type === 'effort'
    );
    variants = effortOption
      ? effortOption.values.flatMap(value => {
          if (value === null) {
            return ['none'];
          }
          return typeof value === 'string' ? [value] : [];
        })
      : getOpenAiReasoningEfforts({
          modelId: devModel.id,
          releaseDate: devModel.release_date
        });
  }
  let providerModelInfo: Record<string, unknown> = {
    modelsDev: devModel,
    modelsDevProvider: {
      api: devProvider.api,
      name: devProvider.name,
      env: devProvider.env,
      id: devProvider.id,
      npm: devProvider.npm
    },
    openAi: openAiModel
  };
  let isOpencodeSupported: boolean =
    devModel.status !== 'alpha' && devModel.status !== 'deprecated';
  return {
    modelId: devModel.id,
    catalogName: devModel.name,
    providerModelInfo: providerModelInfo,
    modelsDevStatus: devModel.status,
    contextLimit: devModel.limit.context,
    inputLimit: devModel.limit.input,
    outputLimit: devModel.limit.output,
    variants: variants.length > 0 ? variants : undefined,
    isOpencodeSupported: isOpencodeSupported
  };
}
