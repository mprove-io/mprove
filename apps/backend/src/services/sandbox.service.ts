import { Sandbox } from '@e2b/code-interpreter';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SandboxAgent } from 'sandbox-agent';
import { BackendConfig } from '#backend/config/backend-config';
import { ErEnum } from '#common/enums/er.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { ServerError } from '#common/models/server-error';

export interface SandboxInfo {
  providerSandboxId: string;
  providerHost: string;
}

@Injectable()
export class SandboxService {
  private clients = new Map<string, SandboxAgent>();

  constructor(private cs: ConfigService<BackendConfig>) {}

  // SDK client management

  async connectClient(item: {
    sessionId: string;
    providerHost: string;
  }): Promise<SandboxAgent> {
    let existing = this.clients.get(item.sessionId);
    if (existing) {
      return existing;
    }

    let sandboxAgentToken =
      this.cs.get<BackendConfig['sandboxAgentToken']>('sandboxAgentToken');

    let client = await SandboxAgent.connect({
      baseUrl: item.providerHost,
      token: sandboxAgentToken
    });

    this.clients.set(item.sessionId, client);
    return client;
  }

  getClient(sessionId: string): SandboxAgent {
    let client = this.clients.get(sessionId);
    if (!client) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_CONNECTION_FAILED
      });
    }
    return client;
  }

  async disposeClient(sessionId: string): Promise<void> {
    let client = this.clients.get(sessionId);
    if (client) {
      await client.dispose().catch(() => {});
      this.clients.delete(sessionId);
    }
  }

  // Sandbox provider operations

  async createSandbox(item: {
    sandboxType: SandboxTypeEnum;
    e2bApiKey: string;
    timeoutMs: number;
    agent: string;
    envs?: Record<string, string>;
  }): Promise<SandboxInfo> {
    try {
      switch (item.sandboxType) {
        case SandboxTypeEnum.E2B:
          return await this.e2bCreateSandbox({
            apiKey: item.e2bApiKey,
            timeoutMs: item.timeoutMs,
            agent: item.agent,
            envs: item.envs
          });
        default:
          throw new ServerError({
            message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
          });
      }
    } catch (e) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SANDBOX_CREATE_FAILED,
        originalError: e
      });
    }
  }

  async stopProviderSandbox(item: {
    sandboxType: SandboxTypeEnum;
    providerSandboxId: string;
    e2bApiKey: string;
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        return this.e2bStopSandbox({
          providerSandboxId: item.providerSandboxId,
          apiKey: item.e2bApiKey
        });
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
        });
    }
  }

  async pauseProviderSandbox(item: {
    sandboxType: SandboxTypeEnum;
    providerSandboxId: string;
    e2bApiKey: string;
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        return this.e2bPauseSandbox({
          providerSandboxId: item.providerSandboxId,
          apiKey: item.e2bApiKey
        });
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
        });
    }
  }

  async resumeProviderSandbox(item: {
    sandboxType: SandboxTypeEnum;
    providerSandboxId: string;
    e2bApiKey: string;
    timeoutMs: number;
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        await this.e2bResumeSandbox({
          providerSandboxId: item.providerSandboxId,
          apiKey: item.e2bApiKey,
          timeoutMs: item.timeoutMs
        });
        break;
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
        });
    }
  }

  // E2B

  private async e2bCreateSandbox(item: {
    apiKey: string;
    timeoutMs: number;
    agent: string;
    envs?: Record<string, string>;
  }): Promise<SandboxInfo> {
    let sandbox = await Sandbox.create({
      apiKey: item.apiKey,
      timeoutMs: item.timeoutMs,
      envs: item.envs
    });

    await sandbox.commands.run(
      'curl -fsSL https://releases.rivet.dev/sandbox-agent/latest/install.sh | sh'
    );

    await sandbox.commands.run(`sandbox-agent install-agent ${item.agent}`);

    await sandbox.commands.run(
      'sandbox-agent server --no-token --host 0.0.0.0 --port 3000',
      { background: true }
    );

    await new Promise(resolve => setTimeout(resolve, 2000));

    let host = sandbox.getHost(3000);

    return {
      providerSandboxId: sandbox.sandboxId,
      providerHost: `https://${host}`
    };
  }

  private async e2bStopSandbox(item: {
    providerSandboxId: string;
    apiKey: string;
  }): Promise<void> {
    await Sandbox.kill(item.providerSandboxId, { apiKey: item.apiKey });
  }

  private async e2bPauseSandbox(item: {
    providerSandboxId: string;
    apiKey: string;
  }): Promise<void> {
    await Sandbox.betaPause(item.providerSandboxId, { apiKey: item.apiKey });
  }

  private async e2bResumeSandbox(item: {
    providerSandboxId: string;
    apiKey: string;
    timeoutMs: number;
  }): Promise<void> {
    await Sandbox.connect(item.providerSandboxId, { apiKey: item.apiKey });
    await Sandbox.setTimeout(item.providerSandboxId, item.timeoutMs, {
      apiKey: item.apiKey
    });
  }
}
