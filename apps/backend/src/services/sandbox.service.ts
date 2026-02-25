import crypto from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpencodeClient, type OpencodeClient } from '@opencode-ai/sdk/v2';
import { Sandbox } from 'e2b';
import { BackendConfig } from '#backend/config/backend-config';
import type { ProjectTab } from '#backend/drizzle/postgres/schema/_tabs';
import { BackendEnvEnum } from '#common/enums/env/backend-env.enum';
import { ErEnum } from '#common/enums/er.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { ServerError } from '#common/models/server-error';

export interface CreateSandboxResult {
  sandboxId: string;
  sandboxBaseUrl: string;
  opencodePassword: string;
  sandbox: Sandbox;
}

@Injectable()
export class SandboxService {
  private opencodeClients = new Map<string, OpencodeClient>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  connectOpenCodeClient(item: {
    sessionId: string;
    sandboxBaseUrl: string;
    opencodePassword: string;
  }): OpencodeClient {
    let existing = this.opencodeClients.get(item.sessionId);

    if (existing) {
      return existing;
    }

    let client = createOpencodeClient({
      baseUrl: item.sandboxBaseUrl,
      directory: '/home/user/project',
      headers: {
        Authorization: `Basic ${Buffer.from(`opencode:${item.opencodePassword}`).toString('base64')}`
      }
    });

    this.opencodeClients.set(item.sessionId, client);

    return client;
  }

  getOpenCodeClient(sessionId: string): OpencodeClient {
    let client = this.opencodeClients.get(sessionId);

    if (!client) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_CLIENT_NOT_FOUND
      });
    }
    return client;
  }

  disposeOpenCodeClient(sessionId: string): void {
    this.opencodeClients.delete(sessionId);
  }

  async startOpencodeServer(item: {
    sandboxType: SandboxTypeEnum;
    sandboxTimeoutMs: number;
    sandboxEnvs?: Record<string, string>;
    project: ProjectTab;
  }): Promise<CreateSandboxResult> {
    try {
      let createSandboxResult: CreateSandboxResult;

      switch (item.sandboxType) {
        case SandboxTypeEnum.E2B: {
          let templateName =
            this.cs.get<BackendConfig['e2bPublicTemplate']>(
              'e2bPublicTemplate'
            );

          console.log(
            `[sandbox] creating E2B sandbox from template: ${templateName}`
          );

          let sandbox = await Sandbox.create(templateName, {
            apiKey: item.project.e2bApiKey,
            allowInternetAccess: true,
            timeoutMs: item.sandboxTimeoutMs
          });

          console.log(`[sandbox] sandbox created: ${sandbox.sandboxId}`);

          await sandbox.commands.run('mkdir -p /home/user/project');

          if (item.project.remoteType === ProjectRemoteTypeEnum.GitClone) {
            console.log('[sandbox] cloning repo...');
            await this.cloneRepoInSandbox({
              sandbox: sandbox,
              gitUrl: item.project.gitUrl,
              defaultBranch: item.project.defaultBranch,
              publicKey: item.project.publicKey,
              privateKeyEncrypted: item.project.privateKeyEncrypted,
              passPhrase: item.project.passPhrase,
              cloneDir: '/home/user/project'
            });
            console.log('[sandbox] repo cloned');
          }

          let opencodePassword = crypto.randomBytes(32).toString('hex');

          console.log('[sandbox] starting opencode serve...');

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

          createSandboxResult = {
            sandboxId: sandbox.sandboxId,
            sandboxBaseUrl: sandboxBaseUrl,
            opencodePassword: opencodePassword,
            sandbox: sandbox
          };

          break;
        }
        default:
          throw new ServerError({
            message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
          });
      }

      return createSandboxResult;
    } catch (e) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SANDBOX_CREATE_FAILED,
        originalError: e
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
          message: ErEnum.BACKEND_AGENT_SANDBOX_GIT_CLONE_FAILED,
          originalError: new Error(cloneResult.stderr)
        });
      }
    } finally {
      await item.sandbox.commands.run(`rm -rf ${keyDir}`).catch(() => {});
    }
  }

  async stopSandbox(item: {
    sandboxType: SandboxTypeEnum;
    sandboxId: string;
    e2bApiKey: string;
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        await Sandbox.kill(item.sandboxId, { apiKey: item.e2bApiKey });

        break;
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
        });
    }
  }

  async pauseSandbox(item: {
    sandboxType: SandboxTypeEnum;
    sandboxId: string;
    e2bApiKey: string;
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        await Sandbox.betaPause(item.sandboxId, { apiKey: item.e2bApiKey });

        break;
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
        });
    }
  }

  async resumeSandbox(item: {
    sandboxType: SandboxTypeEnum;
    sandboxId: string;
    e2bApiKey: string;
    timeoutMs: number;
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        await Sandbox.connect(item.sandboxId, { apiKey: item.e2bApiKey });

        await Sandbox.setTimeout(item.sandboxId, item.timeoutMs, {
          apiKey: item.e2bApiKey
        });

        break;
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
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

    console.log(
      `[sandbox] polling health check at ${item.sandboxBaseUrl}/config`
    );

    for (let i = 0; i < maxAttempts; i++) {
      try {
        let res = await fetch(`${item.sandboxBaseUrl}/config`);

        if (res.status === 401) {
          healthy = true;
          console.log(
            `[sandbox] health check passed on attempt ${i + 1}/${maxAttempts}`
          );
          break;
        } else {
          console.log(
            `[sandbox] health check attempt ${i + 1}/${maxAttempts}: status ${res.status} (expected 401)`
          );
        }
      } catch (e: any) {
        if (backendEnv !== BackendEnvEnum.PROD) {
          console.log(
            `[sandbox] health check attempt ${i + 1}/${maxAttempts} failed: ${e?.message}`
          );
        }
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    if (!healthy) {
      console.log(
        `[sandbox] health check failed after ${maxAttempts} attempts`
      );
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SANDBOX_HEALTH_CHECK_FAILED
      });
    }
  }
}
