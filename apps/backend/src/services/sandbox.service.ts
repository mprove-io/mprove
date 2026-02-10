import crypto from 'node:crypto';
import { Sandbox } from '@e2b/code-interpreter';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SandboxAgent } from 'sandbox-agent';
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
  sandboxAgentToken: string;
  sandbox: Sandbox;
}

@Injectable()
export class SandboxService {
  private saClients = new Map<string, SandboxAgent>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  async connectSaClient(item: {
    sessionId: string;
    sandboxBaseUrl: string;
    sandboxAgentToken: string;
  }): Promise<SandboxAgent> {
    let existing = this.saClients.get(item.sessionId);
    if (existing) {
      return existing;
    }

    let client = await SandboxAgent.connect({
      baseUrl: item.sandboxBaseUrl,
      token: item.sandboxAgentToken
    });

    this.saClients.set(item.sessionId, client);
    return client;
  }

  getSaClient(sessionId: string): SandboxAgent {
    let client = this.saClients.get(sessionId);
    if (!client) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SEND_MESSAGE_FAILED
      });
    }
    return client;
  }

  async disposeSaClient(sessionId: string): Promise<void> {
    let client = this.saClients.get(sessionId);
    if (client) {
      await client.dispose().catch(() => {
        // do nothing
      });

      this.saClients.delete(sessionId);
    }
  }

  getE2bTemplateName(): string {
    return this.cs.get<BackendConfig['e2bPublicTemplate']>('e2bPublicTemplate');
  }

  async createSandbox(item: {
    sandboxType: SandboxTypeEnum;
    sandboxTimeoutMs: number;
    sandboxEnvs?: Record<string, string>;
    agent: string;
    project: ProjectTab;
  }): Promise<CreateSandboxResult> {
    try {
      let createSandboxResult: CreateSandboxResult;

      switch (item.sandboxType) {
        case SandboxTypeEnum.E2B: {
          let templateName = this.getE2bTemplateName();

          let sandbox = await Sandbox.create(templateName, {
            apiKey: item.project.e2bApiKey,
            timeoutMs: item.sandboxTimeoutMs,
            envs: item.sandboxEnvs
          });

          if (item.project.remoteType === ProjectRemoteTypeEnum.GitClone) {
            await this.cloneRepoInSandbox({
              sandbox: sandbox,
              gitUrl: item.project.gitUrl,
              defaultBranch: item.project.defaultBranch,
              publicKey: item.project.publicKey,
              privateKeyEncrypted: item.project.privateKeyEncrypted,
              passPhrase: item.project.passPhrase,
              cloneDir: '/home/user/project'
            });
          }

          let sandboxAgentToken = crypto.randomBytes(32).toString('hex');

          await sandbox.commands.run(
            `sandbox-agent server --token ${sandboxAgentToken} --host 0.0.0.0 --port 3000`,
            { background: true }
          );

          let host = sandbox.getHost(3000);

          let healthy = false;

          let backendEnv =
            this.cs.get<BackendConfig['backendEnv']>('backendEnv');

          for (let i = 0; i < 30; i++) {
            try {
              // let res = await fetch(`https://${host}/v1/health`, {
              //   headers: { Authorization: `Bearer ${sandboxAgentToken}` }
              // });

              let res = await fetch(`https://${host}/v1/health`);

              if (res.ok) {
                healthy = true;
                break;
              }
            } catch (e: any) {
              if (backendEnv !== BackendEnvEnum.PROD) {
                this.logger.warn(
                  `Health check attempt ${i + 1}/30 failed for sandbox ${sandbox.sandboxId}: ${e?.message}`
                );
              }
            }

            await new Promise(r => setTimeout(r, 1000));
          }

          if (!healthy) {
            throw new ServerError({
              message: ErEnum.BACKEND_AGENT_SANDBOX_HEALTH_CHECK_FAILED
            });
          }

          createSandboxResult = {
            sandboxId: sandbox.sandboxId,
            sandboxBaseUrl: `https://${host}`,
            sandboxAgentToken: sandboxAgentToken,
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
}
