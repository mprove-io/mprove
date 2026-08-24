import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import type { LanguageModel } from 'ai';
import type { ProviderTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type AnthropicVariantOptions,
  getAnthropicVariantOptions
} from '#backend/functions/anthropic-model-variants';
import {
  getOpenAiReasoningEfforts,
  getOpenAiVariantOptions,
  isOpenAiGpt5Chat,
  isOpenAiGpt5Family,
  isOpenAiGpt5Pro
} from '#backend/functions/openai-model-variants';
import { ErEnum } from '#common/enums/er.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';

@Injectable()
export class ExplorerModelsService {
  getModel(item: {
    provider: ProviderTab;
    modelId: string;
    codexFetch?: typeof fetch;
  }): LanguageModel {
    let { provider, modelId, codexFetch } = item;

    if (provider.type === ProviderTypeEnum.OpenAI) {
      let openai = createOpenAI({ apiKey: provider.options.apiKey });
      return openai(modelId);
    }

    if (provider.type === ProviderTypeEnum.Anthropic) {
      let anthropic = createAnthropic({ apiKey: provider.options.apiKey });
      return anthropic(modelId);
    }

    if (provider.type === ProviderTypeEnum.OpenAICompatible) {
      let headers = Object.fromEntries(
        (provider.options.headers ?? []).map(x => [x.key, x.value])
      );

      let queryParams = Object.fromEntries(
        (provider.options.queryParams ?? []).map(x => [x.key, x.value])
      );

      let compatible = createOpenAICompatible({
        name: provider.name,
        baseURL: provider.options.baseURL,
        apiKey: provider.options.apiKey ?? undefined,
        headers: headers,
        queryParams: queryParams
      });

      return compatible.chatModel(modelId);
    }

    let isCodexFetchSet = isDefined(codexFetch);

    if (provider.type === ProviderTypeEnum.OpenAICodex && isCodexFetchSet) {
      let openai = createOpenAI({
        apiKey: 'oauth-dummy-key',
        fetch: codexFetch
      });
      return openai(modelId);
    }

    throw new ServerError({
      message: ErEnum.BACKEND_GET_PROVIDER_MODEL_FAILED
    });
  }

  // Reference: external/opencode/packages/opencode/src/provider/transform.ts
  // - options() lines 746-864 (chat/non-small)
  // - smallOptions() lines 866-879 (title/small)
  buildOpenaiProviderOptions(item: {
    modelId: string;
    sessionId: string;
    instructions?: string;
    variant?: string;
    isSmall: boolean;
  }): { openai: Record<string, any> } {
    let { modelId, sessionId, instructions, variant, isSmall } = item;

    let openai: Record<string, any> = {
      store: false
    };

    if (isDefined(instructions)) {
      openai.instructions = instructions;
    }

    let isGpt5: boolean = isOpenAiGpt5Family({ modelId: modelId });

    if (isSmall) {
      if (isGpt5) {
        let efforts: string[] = getOpenAiReasoningEfforts({
          modelId: modelId,
          releaseDate: ''
        });

        let firstEffort: string | undefined = efforts[0];

        if (isDefined(firstEffort)) {
          Object.assign(
            openai,
            getOpenAiVariantOptions({ variant: firstEffort })
          );
        }
      }
    } else {
      let isGpt5Chat: boolean = isOpenAiGpt5Chat({ modelId: modelId });

      let isGpt5Pro: boolean = isOpenAiGpt5Pro({ modelId: modelId });

      if (isGpt5 && !isGpt5Chat && !isGpt5Pro) {
        openai.reasoningEffort = 'medium';
        openai.reasoningSummary = 'auto';
        openai.include = ['reasoning.encrypted_content'];
      }

      openai.promptCacheKey = sessionId;

      let isGpt5Dotted = modelId.includes('gpt-5.');
      let isCodexVariant = modelId.includes('codex');
      let isChatVariant = modelId.includes('-chat');

      if (isGpt5Dotted && !isCodexVariant && !isChatVariant) {
        openai.textVerbosity = 'low';
      }

      if (isDefined(variant) && variant !== 'default') {
        Object.assign(openai, getOpenAiVariantOptions({ variant: variant }));
      }
    }

    return { openai: openai };
  }

  buildAnthropicProviderOptions(item: {
    model: LlmModel;
    variant?: string;
  }): { anthropic: AnthropicVariantOptions } | undefined {
    let { model, variant } = item;

    if (!isDefined(variant) || variant === 'default') {
      return undefined;
    }

    let anthropicModel: Anthropic.Models.ModelInfo =
      model.providerModelInfo as unknown as Anthropic.Models.ModelInfo;

    let options: ReturnType<typeof getAnthropicVariantOptions> =
      getAnthropicVariantOptions({
        anthropicModel: anthropicModel,
        variant: variant
      });

    if (!isDefined(options)) {
      return undefined;
    }

    return { anthropic: options };
  }
}
