import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ProviderTab } from '#backend/drizzle/postgres/schema/_tabs';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { ErEnum } from '#common/enums/er.enum';
import { ProviderKindEnum } from '#common/enums/provider-kind.enum';
import { ProviderLlmTypeEnum } from '#common/enums/provider-llm-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { Provider } from '#common/zod/backend/provider';
import type { LlmOpenAICompatibleOptions } from '#common/zod/backend/provider-parts/llm-openai-compatible-options';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class ProvidersService {
  constructor(
    private hashService: HashService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeProvider(item: {
    projectId: string;
    providerId: string;
    kind: ProviderKindEnum.LLM;
    type: ProviderLlmTypeEnum.OpenAICompatible;
    isEnabled: boolean;
    options: LlmOpenAICompatibleOptions;
  }): ProviderTab {
    let { projectId, providerId, kind, type, isEnabled, options } = item;

    let provider: ProviderTab = {
      providerFullId: this.hashService.makeProviderFullId({
        projectId: projectId,
        providerId: providerId
      }),
      projectId: projectId,
      providerId: providerId,
      kind: kind,
      type: type,
      isEnabled: isEnabled,
      options: options,
      keyTag: undefined,
      serverTs: undefined
    };

    return provider;
  }

  tabToApiProvider(item: {
    provider: ProviderTab;
    isIncludePasswords: boolean;
  }): Provider {
    let { provider, isIncludePasswords } = item;
    let options = provider.options;

    let headers = isDefined(options.headers)
      ? options.headers.map(header => ({
          key: header.key,
          value: isIncludePasswords === true ? header.value : ''
        }))
      : undefined;

    let apiProvider: Provider = {
      projectId: provider.projectId,
      providerId: provider.providerId,
      kind: ProviderKindEnum.LLM,
      type: ProviderLlmTypeEnum.OpenAICompatible,
      isEnabled: provider.isEnabled,
      options: {
        baseURL: options.baseURL,
        apiKey:
          isIncludePasswords === true
            ? options.apiKey
            : isDefined(options.apiKey)
              ? ''
              : undefined,
        headers: headers,
        queryParams: options.queryParams,
        models: options.models.map(model => ({
          modelId: model.modelId,
          name: model.name
        }))
      },
      serverTs: provider.serverTs
    };

    return apiProvider;
  }

  async checkProviderDoesNotExist(item: {
    projectId: string;
    providerId: string;
  }) {
    let { projectId, providerId } = item;

    let provider = await this.db.drizzle.query.providersTable.findFirst({
      where: and(
        eq(providersTable.projectId, projectId),
        eq(providersTable.providerId, providerId)
      )
    });

    if (isDefined(provider)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_ALREADY_EXISTS
      });
    }
  }

  async getProviderCheckExists(item: {
    projectId: string;
    providerId: string;
  }): Promise<ProviderTab> {
    let { projectId, providerId } = item;

    let provider = await this.db.drizzle.query.providersTable
      .findFirst({
        where: and(
          eq(providersTable.projectId, projectId),
          eq(providersTable.providerId, providerId)
        )
      })
      .then(providerEnt =>
        this.tabService.providerEntToTab({ providerEnt: providerEnt })
      );

    if (isUndefined(provider)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_DOES_NOT_EXIST
      });
    }

    return provider;
  }

  checkProviderModelDoesNotExist(item: {
    provider: ProviderTab;
    modelId: string;
  }) {
    let { provider, modelId } = item;

    let model = provider.options.models.find(x => x.modelId === modelId);

    if (isDefined(model)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_ALREADY_EXISTS
      });
    }
  }

  getProviderModelCheckExists(item: {
    provider: ProviderTab;
    modelId: string;
  }) {
    let { provider, modelId } = item;

    let model = provider.options.models.find(x => x.modelId === modelId);

    if (isUndefined(model)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_DOES_NOT_EXIST
      });
    }

    return model;
  }
}
