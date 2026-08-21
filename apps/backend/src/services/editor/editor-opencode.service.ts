import crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpencodeClient, type OpencodeClient } from '@opencode-ai/sdk/v2';
import { Sandbox, type SandboxInfo } from 'e2b';
import pIteration from 'p-iteration';
import type { BackendConfig } from '#backend/config/backend-config';

const { forEachSeries } = pIteration;

import type {
  ProjectTab,
  ProviderTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type AnthropicVariantOptions,
  getAnthropicVariantOptions
} from '#backend/functions/anthropic-model-variants';
import { SessionsService } from '#backend/services/db/sessions.service';
import { BackendEnvEnum } from '#common/enums/env/backend-env.enum';
import { ErEnum } from '#common/enums/er.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import {
  type AnthropicModel,
  zAnthropicModel
} from '#common/zod/backend/anthropic-model';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';

export const OPENCODE_PROJECT_OPENAI_PROVIDER_ID = '_mprove_openai';

export interface CreateSandboxResult {
  sandboxId: string;
  sandboxBaseUrl: string;
  opencodePassword: string;
  sandbox: Sandbox;
  sandboxInfo: SandboxInfo;
}

@Injectable()
export class EditorOpencodeService {
  private opencodeClients: { sessionId: string; client: OpencodeClient }[] = [];

  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionsService: SessionsService
  ) {}

  async buildProviderConfig(item: {
    providers: ProviderTab[];
    isUserCodexAuthSet: boolean;
  }): Promise<{ envs: Record<string, string>; content: string }> {
    let envs: Record<string, string> = {};
    let config: Record<string, Record<string, unknown>> = {};

    await Promise.all(
      item.providers.map(async (provider, index) => {
        let models = provider.models.filter(
          model => model.isOpencodeSupported && model.isBuilder
        );

        let modelIds = models.map(model => model.modelId);

        if (modelIds.length === 0) {
          return;
        }

        if (provider.type === ProviderTypeEnum.OpenAICodex) {
          if (item.isUserCodexAuthSet === false) {
            return;
          }

          let current = config.openai ?? {};

          let whitelist = Array.isArray(current.whitelist)
            ? (current.whitelist as string[])
            : [];

          let currentModels =
            typeof current.models === 'object' && current.models !== null
              ? (current.models as Record<string, unknown>)
              : {};

          config.openai = {
            ...current,
            whitelist: [...new Set([...whitelist, ...modelIds])],
            models: {
              ...currentModels,
              ...Object.fromEntries(
                models.map(model => [
                  model.modelId,
                  llmModelToOpenCodeConfig({ model: model })
                ])
              )
            }
          };

          return;
        }

        let apiKey = provider.options.apiKey;

        if (provider.type === ProviderTypeEnum.OpenAICompatible) {
          let prefix = `MPROVE_LLM_${index}`;

          let apiKeyEnv = `${prefix}_API_KEY`;

          if (apiKey) {
            envs[apiKeyEnv] = apiKey;
          }

          let headers = Object.fromEntries(
            (provider.options.headers ?? []).map((header, headerIndex) => {
              let name = `${prefix}_HEADER_${headerIndex}`;
              envs[name] = header.value;
              return [header.key, `{env:${name}}`];
            })
          );

          let queryParams = Object.fromEntries(
            (provider.options.queryParams ?? []).map((query, queryIndex) => {
              let name = `${prefix}_QUERY_${queryIndex}`;
              envs[name] = query.value;
              return [query.key, `{env:${name}}`];
            })
          );

          config[provider.providerId] = {
            name: provider.name,
            npm: '@ai-sdk/openai-compatible',
            env: apiKey ? [apiKeyEnv] : [],
            options: {
              baseURL: provider.options.baseURL,
              headers: headers,
              queryParams: queryParams
            },
            whitelist: modelIds,
            models: Object.fromEntries(
              models.map(model => [
                model.modelId,
                llmModelToOpenCodeConfig({ model: model })
              ])
            )
          };
          return;
        }

        if (!apiKey) {
          return;
        }

        if (provider.type === ProviderTypeEnum.OpenAI) {
          let apiKeyEnv = 'MPROVE_OPENAI_API_KEY';
          envs[apiKeyEnv] = apiKey;
          config[OPENCODE_PROJECT_OPENAI_PROVIDER_ID] = {
            name: provider.name,
            npm: '@ai-sdk/openai',
            env: [apiKeyEnv],
            whitelist: modelIds,
            models: Object.fromEntries(
              models.map(model => [
                model.modelId,
                llmModelToOpenCodeConfig({ model: model })
              ])
            )
          };
          return;
        }

        if (provider.type === ProviderTypeEnum.Anthropic) {
          envs.ANTHROPIC_API_KEY = apiKey;
          config.anthropic = {
            whitelist: modelIds,
            models: Object.fromEntries(
              models.map(model => [
                model.modelId,
                anthropicModelToOpenCodeConfig({ model: model })
              ])
            )
          };
          return;
        }
      })
    );

    return {
      envs: envs,
      content: JSON.stringify({ provider: config })
    };
  }

  hasOpenCodeClient(item: { sessionId: string }): boolean {
    return this.opencodeClients.some(x => x.sessionId === item.sessionId);
  }

  disposeOpenCodeClient(item: { sessionId: string }): void {
    let { sessionId } = item;
    this.opencodeClients = this.opencodeClients.filter(
      x => x.sessionId !== sessionId
    );
  }

  async getOpenCodeClient(item: {
    sessionId: string;
    sandboxBaseUrl?: string;
    opencodePassword?: string;
  }): Promise<OpencodeClient> {
    let client = this.opencodeClients.find(
      x => x.sessionId === item.sessionId
    )?.client;

    if (!client) {
      let sandboxBaseUrl = item.sandboxBaseUrl;
      let opencodePassword = item.opencodePassword;

      if (!sandboxBaseUrl || !opencodePassword) {
        let session = await this.sessionsService.getSessionByIdCheckExists({
          sessionId: item.sessionId
        });
        sandboxBaseUrl = session.sandboxBaseUrl;
        opencodePassword = session.opencodePassword;
      }

      client = createOpencodeClient({
        baseUrl: sandboxBaseUrl,
        directory: '/home/user/project',
        headers: {
          Authorization: `Basic ${Buffer.from(`opencode:${opencodePassword}`).toString('base64')}`
        }
      });
      this.opencodeClients.push({ sessionId: item.sessionId, client: client });
    }

    return client;
  }

  async startOpencodeServer(item: {
    sandboxType: SandboxTypeEnum;
    sandboxTimeoutMs: number;
    sandboxEnvs: Record<string, string>;
    sandboxFiles: { path: string; data: string }[];
    project: ProjectTab;
    sessionBranch: string;
  }): Promise<CreateSandboxResult> {
    try {
      let createSandboxResult: CreateSandboxResult;

      switch (item.sandboxType) {
        case SandboxTypeEnum.E2B: {
          let templateName =
            this.cs.get<BackendConfig['e2bPublicTemplate']>(
              'e2bPublicTemplate'
            );

          let sandbox = await Sandbox.betaCreate(templateName, {
            autoPause: true,
            apiKey: item.project.e2bApiKey,
            allowInternetAccess: true,
            timeoutMs: item.sandboxTimeoutMs
          });

          await sandbox.commands.run('mkdir -p /home/user/project');

          if (item.project.remoteType === ProjectRemoteTypeEnum.GitClone) {
            await this.cloneRepoInSandbox({
              sandbox: sandbox,
              gitUrl: item.project.gitUrl,
              defaultBranch: item.project.defaultBranch,
              publicKey: item.project.publicKey,
              privateKeyEncrypted: item.project.privateKeyEncrypted,
              passPhrase: item.project.passPhrase,
              cloneDir: '/home/user/project',
              sessionBranch: item.sessionBranch
            });
          }

          if (item.sandboxFiles.length > 0) {
            let uniqueDirPaths = [
              ...new Set(
                item.sandboxFiles.map(f =>
                  f.path.substring(0, f.path.lastIndexOf('/'))
                )
              )
            ];

            await sandbox.commands.run(`mkdir -p ${uniqueDirPaths.join(' ')}`);

            await forEachSeries(item.sandboxFiles, async f => {
              await sandbox.files.write(f.path, f.data);
            });
          }

          let opencodePassword = crypto.randomBytes(32).toString('hex');

          await sandbox.commands.run(
            `cd /home/user/project && opencode serve --port 3000`,
            {
              background: true,
              timeoutMs: 0,
              envs: {
                ...item.sandboxEnvs,
                OPENCODE_SERVER_PASSWORD: opencodePassword
              }
            }
          );

          let host = sandbox.getHost(3000);

          let sandboxBaseUrl = `https://${host}`;

          await this.healthCheckOpenCode({
            sandboxBaseUrl: sandboxBaseUrl,
            maxAttempts: 30
          });

          let sandboxInfo = await sandbox.getInfo();

          createSandboxResult = {
            sandboxId: sandbox.sandboxId,
            sandboxBaseUrl: sandboxBaseUrl,
            opencodePassword: opencodePassword,
            sandbox: sandbox,
            sandboxInfo: sandboxInfo
          };

          break;
        }
        default:
          throw new ServerError({
            message: ErEnum.BACKEND_UNKNOWN_SANDBOX_TYPE
          });
      }

      return createSandboxResult;
    } catch (e) {
      throw new ServerError({
        message: ErEnum.BACKEND_SANDBOX_CREATE_FAILED,
        originalError: e
      });
    }
  }

  async healthCheckOpenCode(item: {
    sandboxBaseUrl: string;
    maxAttempts?: number;
  }): Promise<void> {
    let maxAttempts = item.maxAttempts ?? 15;

    let backendEnv = this.cs.get<BackendConfig['backendEnv']>('backendEnv');

    let healthy = false;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        let res = await fetch(`${item.sandboxBaseUrl}/config`);

        if (res.status === 401) {
          healthy = true;
          break;
        } else {
        }
      } catch (e: any) {
        if (backendEnv !== BackendEnvEnum.PROD) {
          console.log(
            `[healthCheckOpenCode] health check attempt ${i + 1}/${maxAttempts} failed: ${e?.message}`
          );
        }
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    if (!healthy) {
      throw new ServerError({
        message: ErEnum.BACKEND_SANDBOX_HEALTH_CHECK_FAILED
      });
    }
  }

  async cloneRepoInSandbox(item: {
    sandbox: Sandbox;
    gitUrl: string;
    defaultBranch: string;
    publicKey: string;
    privateKeyEncrypted: string;
    passPhrase: string;
    cloneDir: string;
    sessionBranch: string;
  }): Promise<void> {
    let keyDir = '/tmp/ssh-keys';

    let privateKeyPath = `${keyDir}/id_rsa`;
    let pubKeyPath = `${keyDir}/id_rsa.pub`;
    let askpassPath = `${keyDir}/ssh-askpass.sh`;

    await item.sandbox.commands.run(`mkdir -p ${keyDir}`);

    await item.sandbox.files.write(pubKeyPath, item.publicKey);
    await item.sandbox.files.write(privateKeyPath, item.privateKeyEncrypted);
    await item.sandbox.files.write(
      askpassPath,
      '#!/bin/sh\necho $SSH_PASSPHRASE'
    );

    await item.sandbox.commands.run(
      `chmod 600 ${privateKeyPath} && chmod 700 ${askpassPath}`
    );

    try {
      let gitSshCommand = `ssh -i ${privateKeyPath} -F /dev/null -o IdentitiesOnly=yes -o StrictHostKeyChecking=no`;

      let cloneResult = await item.sandbox.commands.run(
        `git clone --branch ${item.defaultBranch} ${item.gitUrl} ${item.cloneDir}`,
        {
          envs: {
            GIT_SSH_COMMAND: gitSshCommand,
            SSH_PASSPHRASE: item.passPhrase,
            SSH_ASKPASS: askpassPath,
            SSH_ASKPASS_REQUIRE: 'force',
            DISPLAY: '1'
          },
          timeoutMs: 5 * 60 * 1000
        }
      );

      if (cloneResult.exitCode !== 0) {
        throw new ServerError({
          message: ErEnum.BACKEND_SANDBOX_GIT_CLONE_FAILED,
          originalError: cloneResult.stderr
        });
      }

      let checkoutResult = await item.sandbox.commands.run(
        `git -C ${item.cloneDir} checkout -b ${item.sessionBranch}`
      );

      if (checkoutResult.exitCode !== 0) {
        throw new ServerError({
          message: ErEnum.BACKEND_SANDBOX_GIT_CHECKOUT_FAILED,
          originalError: checkoutResult.stderr
        });
      }
    } finally {
      await item.sandbox.commands.run(`rm -rf ${keyDir}`).catch(() => {});
    }
  }
}

function anthropicModelToOpenCodeConfig(item: {
  model: LlmModel;
}): Record<string, unknown> {
  let { model } = item;

  let parseResult: ReturnType<typeof zAnthropicModel.safeParse> =
    zAnthropicModel.safeParse(model.providerModelInfo);

  if (parseResult.success === false) {
    return { name: model.name };
  }

  let anthropicModel: AnthropicModel = parseResult.data;

  let variantEntries: [string, AnthropicVariantOptions][] = (
    model.variants ?? []
  ).flatMap(variant => {
    let options: ReturnType<typeof getAnthropicVariantOptions> =
      getAnthropicVariantOptions({
        anthropicModel: anthropicModel,
        variant: variant
      });

    return isDefined(options) ? [[variant, options]] : [];
  });

  let inputModalities: string[] = ['text'];

  let isImageInputSupported: boolean =
    anthropicModel.capabilities?.image_input?.supported === true;

  if (isImageInputSupported) {
    inputModalities.push('image');
  }

  let isPdfInputSupported: boolean =
    anthropicModel.capabilities?.pdf_input?.supported === true;

  if (isPdfInputSupported) {
    inputModalities.push('pdf');
  }

  let modelConfig: Record<string, unknown> = {
    name: model.name ?? model.catalogName,
    release_date: anthropicModel.created_at.slice(0, 10),
    reasoning: anthropicModel.capabilities?.thinking?.supported === true,
    attachment: inputModalities.length > 1,
    tool_call: true,
    limit: {
      context: anthropicModel.max_input_tokens ?? 0,
      input: anthropicModel.max_input_tokens,
      output: anthropicModel.max_tokens ?? 0
    },
    modalities: {
      input: inputModalities,
      output: ['text']
    },
    variants: Object.fromEntries(variantEntries)
  };

  return modelConfig;
}

function llmModelToOpenCodeConfig(item: {
  model: LlmModel;
}): Record<string, unknown> {
  let { model } = item;

  let modelConfig: Record<string, unknown> = { name: model.name };

  if (isDefined(model.contextLimit)) {
    modelConfig.limit = {
      context: model.contextLimit,
      input: model.inputLimit,
      output: model.outputLimit ?? 0
    };
  }

  return modelConfig;
}
