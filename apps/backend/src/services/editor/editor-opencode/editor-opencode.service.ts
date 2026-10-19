import crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpencodeClient, type OpencodeClient } from '@opencode-ai/sdk/v2';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  type CommandHandle,
  type ProcessInfo,
  Sandbox,
  type SandboxInfo
} from 'e2b';
import pIteration from 'p-iteration';
import type { BackendConfig } from '#backend/config/backend-config';
import type {
  ProjectTab,
  ProviderTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { DbService } from '#backend/services/db/db.service';
import { anthropicModelToOpenCodeConfig } from '#backend/services/editor/editor-opencode/anthropic-model-to-open-code-config/anthropic-model-to-open-code-config';
import { llmModelToOpenCodeConfig } from '#backend/services/editor/editor-opencode/llm-model-to-open-code-config/llm-model-to-open-code-config';
import { openAiModelToOpenCodeConfig } from '#backend/services/editor/editor-opencode/open-ai-model-to-open-code-config/open-ai-model-to-open-code-config';
import { ServerError } from '#common/classes/server-error/server-error';
import type { GetOpenCodeClientError } from '#common/types/backend/function-errors/get-open-code-client-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import type { HealthCheckOpenCodeError } from '#common/types/backend/function-errors/health-check-open-code-error';
import type { RestartOpencodeServerError } from '#common/types/backend/function-errors/restart-opencode-server-error';
import type { SandboxType } from '#common/types/backend/parts/session/sandbox-type';
import { wrapError } from '#node-common/functions/wrap-error/wrap-error';

const { forEachSeries } = pIteration;
export const OPENCODE_PROJECT_OPENAI_PROVIDER_ID = '_mprove_openai';
export interface CreateSandboxResult {
  sandboxId: string;
  sandboxBaseUrl: string;
  opencodePassword: string;
  sandbox: Sandbox;
  sandboxInfo: SandboxInfo;
}
export interface ProviderConfigResult {
  envs: Record<string, string>;
  content: string;
  hash: string;
}
@Injectable()
export class EditorOpencodeService {
  private opencodeClients: {
    sessionId: string;
    client: OpencodeClient;
  }[] = [];
  constructor(
    private cs: ConfigService<BackendConfig>,
    private db: DbService
  ) {}
  async buildProviderConfig(item: {
    providers: ProviderTab[];
    isUserCodexAuthSet: boolean;
  }): Promise<ProviderConfigResult> {
    let envs: Record<string, string> = {};
    let config: Record<string, Record<string, unknown>> = {};
    let providers = [...item.providers].sort((a, b) =>
      a.providerId.localeCompare(b.providerId)
    );
    await Promise.all(
      providers.map(async (provider, index) => {
        let models = provider.models
          .filter(model => model.isOpencodeSupported && model.isBuilder)
          .sort((a, b) => a.modelId.localeCompare(b.modelId));
        let modelIds = models.map(model => model.modelId);
        if (modelIds.length === 0) {
          return;
        }
        if (provider.type === 'OpenAICodex') {
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
        if (provider.type === 'OpenAICompatible') {
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
        if (provider.type === 'OpenAI') {
          let apiKeyEnv = 'MPROVE_OPENAI_API_KEY';
          envs[apiKeyEnv] = apiKey;
          config[OPENCODE_PROJECT_OPENAI_PROVIDER_ID] = {
            name: provider.name,
            npm: '@ai-sdk/openai',
            env: [apiKeyEnv],
            options: { setCacheKey: true },
            whitelist: modelIds,
            models: Object.fromEntries(
              models.map(model => [
                model.modelId,
                openAiModelToOpenCodeConfig({ model: model })
              ])
            )
          };
          return;
        }
        if (provider.type === 'Anthropic') {
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
    let content = JSON.stringify({ provider: config });
    let sandboxMproveCliHost: string = this.cs.get<
      BackendConfig['sandboxMproveCliHost']
    >('sandboxMproveCliHost');
    let hash = crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          content: content,
          envs: envs,
          sandboxMproveCliHost: sandboxMproveCliHost
        })
      )
      .digest('hex');
    return {
      envs: envs,
      content: content,
      hash: hash
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
  async getOpenCodeClientUnwrap(item: {
    sessionId: string;
    sandboxBaseUrl?: string;
    opencodePassword?: string;
  }): Promise<OpencodeClient> {
    let { sessionId, sandboxBaseUrl, opencodePassword } = item;

    let result: Result.Result<OpencodeClient, GetOpenCodeClientError> =
      await this.getOpenCodeClient({
        sessionId: sessionId,
        sandboxBaseUrl: sandboxBaseUrl,
        opencodePassword: opencodePassword
      });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let client: OpencodeClient = result.value;

    return client;
  }

  async getOpenCodeClient(item: {
    sessionId: string;
    sandboxBaseUrl?: string;
    opencodePassword?: string;
  }): Result.ResultAsync<OpencodeClient, GetOpenCodeClientError> {
    let { sessionId, sandboxBaseUrl, opencodePassword } = item;

    let client: OpencodeClient = this.opencodeClients.find(
      x => x.sessionId === sessionId
    )?.client;

    if (!client) {
      if (!sandboxBaseUrl || !opencodePassword) {
        let sessionResult: Result.Result<
          SessionTab,
          GetSessionByIdCheckExistsError
        > = await this.db.sessions.findFirstCheckExists({
          where: eq(sessionsTable.sessionId, sessionId)
        });

        if (Result.isFailure(sessionResult)) {
          return sessionResult;
        }

        let session: SessionTab = sessionResult.value;

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
      this.opencodeClients.push({ sessionId: sessionId, client: client });
    }

    return Result.succeed(client);
  }
  async startOpencodeServer(item: {
    sandboxType: SandboxType;
    sandboxTimeoutMs: number;
    sandboxEnvs: Record<string, string>;
    sandboxFiles: {
      path: string;
      data: string;
    }[];
    project: ProjectTab;
    sessionBranch: string;
  }): Promise<CreateSandboxResult> {
    try {
      let createSandboxResult: CreateSandboxResult;
      switch (item.sandboxType) {
        case 'E2B': {
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
          if (item.project.remoteType === 'GitClone') {
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
          await this.healthCheckOpenCodeUnwrap({
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
            message: 'BACKEND_UNKNOWN_SANDBOX_TYPE'
          });
      }
      return createSandboxResult;
    } catch (e) {
      throw new ServerError({
        message: 'BACKEND_SANDBOX_CREATE_FAILED',
        originalError: e
      });
    }
  }
  async restartOpencodeServer(item: {
    sessionId: string;
    sandboxType: SandboxType;
    sandboxId: string;
    e2bApiKey: string;
    sandboxBaseUrl: string;
    opencodePassword: string;
    sandboxEnvs: Record<string, string>;
    sessionApiKey: string;
  }): Result.ResultAsync<void, RestartOpencodeServerError> {
    let {
      sessionId,
      sandboxType,
      sandboxId,
      e2bApiKey,
      sandboxBaseUrl,
      opencodePassword,
      sandboxEnvs,
      sessionApiKey
    } = item;

    try {
      switch (sandboxType) {
        case 'E2B': {
          let sandbox: Sandbox = await Sandbox.connect(sandboxId, {
            apiKey: e2bApiKey
          });

          let processes: ProcessInfo[] = await sandbox.commands.list();

          let opencodeProcesses: ProcessInfo[] = processes.filter(process =>
            [process.cmd, ...process.args].join(' ').includes('opencode serve')
          );
          let refreshedSandboxEnvs: Record<string, string> = {
            ...sandboxEnvs,
            MPROVE_CLI_API_KEY: sessionApiKey
          };

          for (let i = 0; i < opencodeProcesses.length; i++) {
            let processKilled: boolean = await sandbox.commands.kill(
              opencodeProcesses[i].pid
            );

            if (processKilled === false) {
              throw new Error(
                'Previous OpenCode server process was not killed'
              );
            }
          }

          this.disposeOpenCodeClient({ sessionId: sessionId });

          let serverProcess: CommandHandle = await sandbox.commands.run(
            `cd /home/user/project && opencode serve --port 3000`,
            {
              background: true,
              timeoutMs: 0,
              envs: {
                ...refreshedSandboxEnvs,
                OPENCODE_SERVER_PASSWORD: opencodePassword
              }
            }
          );

          let healthResult: Result.Result<void, HealthCheckOpenCodeError> =
            await this.healthCheckOpenCode({
              sandboxBaseUrl: sandboxBaseUrl,
              opencodePassword: opencodePassword,
              maxAttempts: 30
            });

          if (Result.isFailure(healthResult)) {
            return Result.fail({
              code: 'BACKEND_SANDBOX_OPENCODE_REFRESH_FAILED',
              customData: {
                originalError: wrapError(
                  new ServerError({ message: healthResult.error.code })
                )
              }
            });
          }

          let runningProcesses: ProcessInfo[] = await sandbox.commands.list();

          let startedProcesses: ProcessInfo[] = runningProcesses.filter(
            process => process.pid === serverProcess.pid
          );

          if (startedProcesses.length === 0) {
            throw new Error('Refreshed OpenCode server process exited');
          }

          return Result.succeed();
        }
        default:
          return Result.fail({
            code: 'BACKEND_SANDBOX_OPENCODE_REFRESH_FAILED',
            customData: {
              originalError: wrapError(
                new ServerError({ message: 'BACKEND_UNKNOWN_SANDBOX_TYPE' })
              )
            }
          });
      }
    } catch (e) {
      return Result.fail({
        code: 'BACKEND_SANDBOX_OPENCODE_REFRESH_FAILED',
        customData: { originalError: e instanceof Error ? wrapError(e) : e }
      });
    }
  }
  async healthCheckOpenCodeUnwrap(item: {
    sandboxBaseUrl: string;
    opencodePassword?: string;
    maxAttempts?: number;
  }): Promise<void> {
    let { sandboxBaseUrl, opencodePassword, maxAttempts } = item;

    let result: Result.Result<void, HealthCheckOpenCodeError> =
      await this.healthCheckOpenCode({
        sandboxBaseUrl: sandboxBaseUrl,
        opencodePassword: opencodePassword,
        maxAttempts: maxAttempts
      });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }
  }

  async healthCheckOpenCode(item: {
    sandboxBaseUrl: string;
    opencodePassword?: string;
    maxAttempts?: number;
  }): Result.ResultAsync<void, HealthCheckOpenCodeError> {
    let { sandboxBaseUrl, opencodePassword, maxAttempts = 15 } = item;

    let backendEnv: BackendConfig['backendEnv'] =
      this.cs.get<BackendConfig['backendEnv']>('backendEnv');

    let isHealthy = false;

    let headers: Record<string, string> = {};

    if (opencodePassword) {
      headers.Authorization = `Basic ${Buffer.from(`opencode:${opencodePassword}`).toString('base64')}`;
    }

    for (let i = 0; i < maxAttempts; i++) {
      try {
        let res: Response = await fetch(`${sandboxBaseUrl}/config`, {
          headers: headers
        });

        let isExpectedStatus: boolean = opencodePassword
          ? res.ok
          : res.status === 401;

        if (isExpectedStatus) {
          isHealthy = true;

          break;
        }
      } catch (e: any) {
        if (backendEnv !== 'PROD') {
          console.log(
            `[healthCheckOpenCode] health check attempt ${i + 1}/${maxAttempts} failed: ${e?.message}`
          );
        }
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    if (isHealthy === false) {
      return Result.fail({ code: 'BACKEND_SANDBOX_HEALTH_CHECK_FAILED' });
    }

    return Result.succeed();
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
          message: 'BACKEND_SANDBOX_GIT_CLONE_FAILED',
          originalError: cloneResult.stderr
        });
      }
      let checkoutResult = await item.sandbox.commands.run(
        `git -C ${item.cloneDir} checkout -b ${item.sessionBranch}`
      );
      if (checkoutResult.exitCode !== 0) {
        throw new ServerError({
          message: 'BACKEND_SANDBOX_GIT_CHECKOUT_FAILED',
          originalError: checkoutResult.stderr
        });
      }
    } finally {
      await item.sandbox.commands.run(`rm -rf ${keyDir}`).catch(() => {});
    }
  }
}
