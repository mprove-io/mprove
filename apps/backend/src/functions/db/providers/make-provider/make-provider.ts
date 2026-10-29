import { Result } from '@praha/byethrow';
import type { ProviderTab } from '#backend/drizzle/postgres/tables/providers';
import { makeProviderFullId } from '#backend/functions/hash/make-provider-full-id/make-provider-full-id';
import {
  PROVIDER_NAME_BY_ID,
  PROVIDER_TYPE_BY_ID,
  RESERVED_PROVIDER_IDS
} from '#common/constants/providers';
import type { MakeProviderError } from '#common/types/backend/function-errors/make-provider-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { ProviderOptionsAnthropic } from '#common/types/backend/parts/provider/options/provider-options-anthropic';
import type { ProviderOptionsCodex } from '#common/types/backend/parts/provider/options/provider-options-codex';
import type { ProviderOptionsOpenAI } from '#common/types/backend/parts/provider/options/provider-options-openai';
import type { ProviderOptionsOpenAICompatible } from '#common/types/backend/parts/provider/options/provider-options-openai-compatible';
import type { ProviderType } from '#common/types/backend/parts/provider/provider-type';

export function makeProvider(
  item: {
    projectId: string;
    providerId: string;
    isEnabled: boolean;
    models: LlmModel[];
  } & (
    | { type: 'OpenAI'; options: ProviderOptionsOpenAI }
    | { type: 'Anthropic'; options: ProviderOptionsAnthropic }
    | {
        type: 'OpenAICompatible';
        name: string;
        options: ProviderOptionsOpenAICompatible;
      }
    | { type: 'OpenAICodex'; options: ProviderOptionsCodex }
  )
): Result.Result<ProviderTab, MakeProviderError> {
  let { projectId, providerId, isEnabled, models } = item;

  let expectedProviderType: ProviderType = PROVIDER_TYPE_BY_ID[providerId];

  let isInvalidBuiltIn =
    item.type !== 'OpenAICompatible' && expectedProviderType !== item.type;

  let isReservedProviderId: boolean =
    RESERVED_PROVIDER_IDS.includes(providerId);

  let isReservedCompatible =
    item.type === 'OpenAICompatible' && isReservedProviderId;

  if (isInvalidBuiltIn || isReservedCompatible) {
    return Result.fail({ code: 'BACKEND_PROVIDER_TYPE_MISMATCH' });
  }

  let common: Omit<ProviderTab, 'type' | 'options'> = {
    providerFullId: makeProviderFullId({
      projectId: projectId,
      providerId: providerId
    }),
    projectId: projectId,
    providerId: providerId,
    name:
      item.type === 'OpenAICompatible'
        ? item.name
        : PROVIDER_NAME_BY_ID[providerId],
    isEnabled: isEnabled,
    models: models,
    keyTag: undefined,
    serverTs: undefined,
    emptyData: undefined
  };

  let provider: ProviderTab =
    item.type === 'OpenAI'
      ? { type: item.type, ...common, options: item.options }
      : item.type === 'Anthropic'
        ? { type: item.type, ...common, options: item.options }
        : item.type === 'OpenAICodex'
          ? { type: item.type, ...common, options: item.options }
          : { type: item.type, ...common, options: item.options };

  return Result.succeed(provider);
}
