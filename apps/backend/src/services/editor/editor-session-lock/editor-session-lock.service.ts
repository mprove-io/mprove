import crypto from 'node:crypto';
import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { Redis } from 'ioredis';
import type { BackendConfig } from '#backend/config/backend-config';
import { ServerError } from '#common/classes/server-error/server-error';
import { KEY_EDITOR_SESSION_LOCK } from '#common/constants/top-backend';
import type { AcquireSessionLockResultError } from '#common/types/backend/function-errors/acquire-session-lock-result-error';

@Injectable()
export class EditorSessionLockService implements OnModuleDestroy {
  private readonly LOCK_TTL_SECONDS = 120;
  private readonly LOCK_WAIT_TIMEOUT_MS = 125_000;

  private redisClient: Redis;

  private lockIntervals = new Map<string, NodeJS.Timeout>();

  constructor(private cs: ConfigService<BackendConfig>) {
    let valkeyHost =
      this.cs.get<BackendConfig['backendValkeyHost']>('backendValkeyHost');

    let valkeyPassword = this.cs.get<BackendConfig['backendValkeyPassword']>(
      'backendValkeyPassword'
    );

    this.redisClient = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
    });
  }

  async acquireSessionLock(item: { sessionId: string }): Promise<string> {
    let result: Result.Result<string, AcquireSessionLockResultError> =
      await this.acquireSessionLockResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let token: string = result.value;

    return token;
  }

  async acquireSessionLockResult(item: {
    sessionId: string;
  }): Result.ResultAsync<string, AcquireSessionLockResultError> {
    let { sessionId } = item;

    let token: string = crypto.randomUUID();

    let startTs: number = Date.now();

    while (true) {
      let result: string = await this.redisClient.set(
        `${KEY_EDITOR_SESSION_LOCK}:${sessionId}`,
        token,
        'EX',
        this.LOCK_TTL_SECONDS,
        'NX'
      );

      if (result === 'OK') {
        let interval: NodeJS.Timeout = setInterval(
          () => {
            this.redisClient
              .eval(
                `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("expire", KEYS[1], ${this.LOCK_TTL_SECONDS}) else return 0 end`,
                1,
                `${KEY_EDITOR_SESSION_LOCK}:${sessionId}`,
                token
              )
              .catch(() => {});
          },
          (this.LOCK_TTL_SECONDS * 1000) / 3
        );

        this.lockIntervals.set(token, interval);

        return Result.succeed(token);
      }

      let elapsed: number = Date.now() - startTs;

      if (elapsed >= this.LOCK_WAIT_TIMEOUT_MS) {
        return Result.fail({
          code: 'BACKEND_EDITOR_SESSION_LOCK_FAILED'
        });
      }

      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  async releaseSessionLock(item: {
    sessionId: string;
    token: string;
  }): Promise<void> {
    let interval = this.lockIntervals.get(item.token);

    if (interval) {
      clearInterval(interval);
      this.lockIntervals.delete(item.token);
    }

    await this.redisClient.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
      1,
      `${KEY_EDITOR_SESSION_LOCK}:${item.sessionId}`,
      item.token
    );
  }

  onModuleDestroy(): void {
    this.lockIntervals.forEach(interval => clearInterval(interval));
    this.lockIntervals.clear();
    this.redisClient.disconnect();
  }
}
