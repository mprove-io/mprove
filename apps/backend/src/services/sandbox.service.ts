import crypto from 'node:crypto';
import { Sandbox } from '@e2b/code-interpreter';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SandboxAgent } from 'sandbox-agent';
import { BackendConfig } from '#backend/config/backend-config';
import { BackendEnvEnum } from '#common/enums/env/backend-env.enum';
import { ErEnum } from '#common/enums/er.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { ServerError } from '#common/models/server-error';

export interface SandboxInfo {
  sandboxId: string;
  sandboxBaseUrl: string;
  sandboxAgentToken: string;
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
    e2bApiKey: string;
  }): Promise<SandboxInfo> {
    try {
      let sandboxInfo: SandboxInfo;

      switch (item.sandboxType) {
        case SandboxTypeEnum.E2B: {
          let templateName = this.getE2bTemplateName();

          let sandbox = await Sandbox.create(templateName, {
            apiKey: item.e2bApiKey,
            timeoutMs: item.sandboxTimeoutMs,
            envs: item.sandboxEnvs
          });

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

          sandboxInfo = {
            sandboxId: sandbox.sandboxId,
            sandboxBaseUrl: `https://${host}`,
            sandboxAgentToken: sandboxAgentToken
          };
          break;
        }
        default:
          throw new ServerError({
            message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
          });
      }

      return sandboxInfo;
    } catch (e) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SANDBOX_CREATE_FAILED,
        originalError: e
      });
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
