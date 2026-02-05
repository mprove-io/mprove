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

interface CreateSandboxParams {
  timeoutMs: number;
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
    timeoutMs: number;
  }): Promise<SandboxInfo> {
    try {
      switch (item.sandboxType) {
        case SandboxTypeEnum.E2B:
          return await this.e2bCreateSandbox({ timeoutMs: item.timeoutMs });
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
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        return this.e2bStopSandbox(item.providerSandboxId);
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
        });
    }
  }

  async pauseProviderSandbox(item: {
    sandboxType: SandboxTypeEnum;
    providerSandboxId: string;
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        return this.e2bPauseSandbox(item.providerSandboxId);
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
        });
    }
  }

  async resumeProviderSandbox(item: {
    sandboxType: SandboxTypeEnum;
    providerSandboxId: string;
    timeoutMs: number;
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        await this.e2bResumeSandbox(item.providerSandboxId, item.timeoutMs);
        break;
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
        });
    }
  }

  // E2B

  private async e2bCreateSandbox(
    params: CreateSandboxParams
  ): Promise<SandboxInfo> {
    let apiKey = this.cs.get<BackendConfig['e2bApiKey']>('e2bApiKey');

    let sandbox = await Sandbox.create({
      apiKey: apiKey,
      timeoutMs: params.timeoutMs
    });

    let host = sandbox.getHost(49982);

    return {
      providerSandboxId: sandbox.sandboxId,
      providerHost: `https://${host}`
    };
  }

  private async e2bStopSandbox(providerSandboxId: string): Promise<void> {
    let apiKey = this.cs.get<BackendConfig['e2bApiKey']>('e2bApiKey');

    await Sandbox.kill(providerSandboxId, { apiKey: apiKey });
  }

  private async e2bPauseSandbox(providerSandboxId: string): Promise<void> {
    let apiKey = this.cs.get<BackendConfig['e2bApiKey']>('e2bApiKey');

    await Sandbox.betaPause(providerSandboxId, { apiKey: apiKey });
  }

  private async e2bResumeSandbox(
    providerSandboxId: string,
    timeoutMs: number
  ): Promise<void> {
    let apiKey = this.cs.get<BackendConfig['e2bApiKey']>('e2bApiKey');

    await Sandbox.connect(providerSandboxId, { apiKey: apiKey });
    await Sandbox.setTimeout(providerSandboxId, timeoutMs, {
      apiKey: apiKey
    });
  }
}
