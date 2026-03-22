import crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpencodeClient, type OpencodeClient } from '@opencode-ai/sdk/v2';
import { Sandbox, type SandboxInfo } from 'e2b';
import { BackendConfig } from '#backend/config/backend-config';
import type { ProjectTab } from '#backend/drizzle/postgres/schema/_tabs';
import { SessionsService } from '#backend/services/db/sessions.service';
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
  sandboxInfo: SandboxInfo;
}

@Injectable()
export class EditorOpencodeService {
  private opencodeClients: { sessionId: string; client: OpencodeClient }[] = [];

  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionsService: SessionsService
  ) {}

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
        message: ErEnum.BACKEND_AGENT_SANDBOX_HEALTH_CHECK_FAILED
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
          message: ErEnum.BACKEND_AGENT_SANDBOX_GIT_CLONE_FAILED,
          originalError: cloneResult.stderr
        });
      }

      let checkoutResult = await item.sandbox.commands.run(
        `git -C ${item.cloneDir} checkout -b ${item.sessionBranch}`
      );

      if (checkoutResult.exitCode !== 0) {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_SANDBOX_GIT_CHECKOUT_FAILED,
          originalError: checkoutResult.stderr
        });
      }
    } finally {
      await item.sandbox.commands.run(`rm -rf ${keyDir}`).catch(() => {});
    }
  }
}
