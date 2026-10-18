import {
  type CanActivate,
  type ExecutionContext,
  Injectable
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import { ServerError } from '#common/classes/server-error/server-error';
import type { CheckTestRoutesAllowedError } from '#common/types/backend/function-errors/check-test-routes-allowed-error';

@Injectable()
export class TestRoutesGuard implements CanActivate {
  constructor(private cs: ConfigService<BackendConfig>) {}

  canActivate(context: ExecutionContext): boolean {
    let allowTestRoutes: boolean =
      this.cs.get<BackendConfig['allowTestRoutes']>('allowTestRoutes');

    let result: Result.Result<void, CheckTestRoutesAllowedError> =
      this.checkTestRoutesAllowed({ allowTestRoutes: allowTestRoutes });

    // Nest requires a boolean or rejection, not a domain Result.
    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code
      });
    }

    return true;
  }

  private checkTestRoutesAllowed(item: {
    allowTestRoutes?: boolean;
  }): Result.Result<void, CheckTestRoutesAllowedError> {
    let { allowTestRoutes } = item;

    return allowTestRoutes === false
      ? Result.fail({ code: 'BACKEND_TEST_ROUTES_FORBIDDEN' })
      : Result.succeed();
  }
}
