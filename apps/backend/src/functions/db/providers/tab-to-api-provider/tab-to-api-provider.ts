import type { ProviderTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID,
  OPENAI_PROVIDER_ID,
  PROVIDER_NAME_BY_ID
} from '#common/constants/providers';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { Provider } from '#common/types/backend/parts/provider/provider';

export function tabToApiProvider(item: {
  provider: ProviderTab;
  isIncludePasswords: boolean;
}): Provider {
  let { provider, isIncludePasswords } = item;

  let models: LlmModel[] = provider.models.map(model => ({
    modelId: model.modelId,
    name: model.name,
    isManual: model.isManual,
    catalogName: model.catalogName,
    providerModelInfo: model.providerModelInfo,
    modelsDevStatus: model.modelsDevStatus,
    contextLimit: model.contextLimit,
    inputLimit: model.inputLimit,
    outputLimit: model.outputLimit,
    codexContextWindow: model.codexContextWindow,
    codexMaxContextWindow: model.codexMaxContextWindow,
    variants: model.variants,
    isOpencodeSupported: model.isOpencodeSupported,
    isExplorer: model.isExplorer,
    isBuilder: model.isBuilder,
    refreshedTs: model.refreshedTs
  }));

  let common = {
    projectId: provider.projectId,
    providerId: provider.providerId,
    name:
      provider.type === 'OpenAICompatible'
        ? provider.name
        : PROVIDER_NAME_BY_ID[provider.providerId],
    isEnabled: provider.isEnabled,
    models: models,
    serverTs: provider.serverTs
  };

  if (provider.type === 'OpenAICodex') {
    return {
      ...common,
      providerId: CODEX_PROVIDER_ID,
      type: provider.type,
      options: {}
    };
  }

  let apiKey =
    isIncludePasswords === true
      ? provider.options.apiKey
      : isDefined(provider.options.apiKey)
        ? ''
        : undefined;

  if (provider.type === 'OpenAICompatible') {
    let headers = isDefined(provider.options.headers)
      ? provider.options.headers.map(header => ({
          key: header.key,
          value: isIncludePasswords === true ? header.value : ''
        }))
      : undefined;

    let queryParams = isDefined(provider.options.queryParams)
      ? provider.options.queryParams.map(queryParam => ({
          key: queryParam.key,
          value: isIncludePasswords === true ? queryParam.value : ''
        }))
      : undefined;

    return {
      ...common,
      type: provider.type,
      options: {
        baseURL: provider.options.baseURL,
        apiKey: apiKey,
        headers: headers,
        queryParams: queryParams
      }
    };
  }

  if (provider.type === 'OpenAI') {
    return {
      ...common,
      providerId: OPENAI_PROVIDER_ID,
      type: provider.type,
      options: {
        apiKey: apiKey
      }
    };
  }

  return {
    ...common,
    providerId: ANTHROPIC_PROVIDER_ID,
    type: provider.type,
    options: {
      apiKey: apiKey
    }
  };
}
