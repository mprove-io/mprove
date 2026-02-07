import crypto from 'node:crypto';
import { Sandbox } from '@e2b/code-interpreter';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SandboxAgent } from 'sandbox-agent';
import { BackendConfig } from '#backend/config/backend-config';
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
  private clients = new Map<string, SandboxAgent>();

  constructor(private cs: ConfigService<BackendConfig>) {}

  // SDK client management

  async connectClient(item: {
    sessionId: string;
    sandboxBaseUrl: string;
    sandboxAgentToken: string;
  }): Promise<SandboxAgent> {
    let existing = this.clients.get(item.sessionId);
    if (existing) {
      return existing;
    }

    let client = await SandboxAgent.connect({
      baseUrl: item.sandboxBaseUrl,
      token: item.sandboxAgentToken
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
    sandboxTimeoutMs: number;
    sandboxEnvs?: Record<string, string>;
    agent: string;
    e2bApiKey: string;
  }): Promise<SandboxInfo> {
    try {
      let sandboxInfo: SandboxInfo;

      switch (item.sandboxType) {
        case SandboxTypeEnum.E2B:
          sandboxInfo = await this.e2bCreateSandbox({
            sandboxTimeoutMs: item.sandboxTimeoutMs,
            sandboxEnvs: item.sandboxEnvs,
            agent: item.agent,
            e2bApiKey: item.e2bApiKey
          });
          break;
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
        return this.e2bStopSandbox({
          sandboxId: item.sandboxId,
          apiKey: item.e2bApiKey
        });
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
        return this.e2bPauseSandbox({
          sandboxId: item.sandboxId,
          apiKey: item.e2bApiKey
        });
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
        await this.e2bResumeSandbox({
          sandboxId: item.sandboxId,
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
    agent: string;
    sandboxTimeoutMs: number;
    sandboxEnvs?: Record<string, string>;
    e2bApiKey: string;
  }): Promise<SandboxInfo> {
    let sandbox = await Sandbox.create({
      apiKey: item.e2bApiKey,
      timeoutMs: item.sandboxTimeoutMs,
      envs: item.sandboxEnvs
    });

    let sandboxAgentVersion = this.cs.get<BackendConfig['sandboxAgentVersion']>(
      'sandboxAgentVersion'
    );

    await sandbox.commands.run(
      `curl -fsSL https://releases.rivet.dev/sandbox-agent/${sandboxAgentVersion}/install.sh | SANDBOX_AGENT_VERSION=${sandboxAgentVersion} sh`
    );

    await sandbox.commands.run(`sandbox-agent install-agent ${item.agent}`);

    let sandboxAgentToken = crypto.randomBytes(32).toString('hex');

    await sandbox.commands.run(
      `sandbox-agent server --token ${sandboxAgentToken} --host 0.0.0.0 --port 3000`,
      { background: true }
    );

    let host = sandbox.getHost(3000);

    let healthy = false;

    for (let i = 0; i < 20; i++) {
      try {
        let res = await fetch(`https://${host}/v1/health`);
        if (res.ok) {
          healthy = true;
          break;
        }
      } catch {}
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!healthy) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SANDBOX_HEALTH_CHECK_FAILED
      });
    }

    let sandboxInfo: SandboxInfo = {
      sandboxId: sandbox.sandboxId,
      sandboxBaseUrl: `https://${host}`,
      sandboxAgentToken: sandboxAgentToken
    };

    return sandboxInfo;
  }

  private async e2bStopSandbox(item: {
    sandboxId: string;
    apiKey: string;
  }): Promise<void> {
    await Sandbox.kill(item.sandboxId, { apiKey: item.apiKey });
  }

  private async e2bPauseSandbox(item: {
    sandboxId: string;
    apiKey: string;
  }): Promise<void> {
    await Sandbox.betaPause(item.sandboxId, { apiKey: item.apiKey });
  }

  private async e2bResumeSandbox(item: {
    sandboxId: string;
    apiKey: string;
    timeoutMs: number;
  }): Promise<void> {
    await Sandbox.connect(item.sandboxId, { apiKey: item.apiKey });
    await Sandbox.setTimeout(item.sandboxId, item.timeoutMs, {
      apiKey: item.apiKey
    });
  }
}
