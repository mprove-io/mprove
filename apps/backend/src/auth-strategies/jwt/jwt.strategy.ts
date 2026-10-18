import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';

import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendUserDoesNotExistError } from '#common/types/backend/errors/backend-user-does-not-exist-error';
import type { AuthenticateJwtError } from '#common/types/backend/function-errors/authenticate-jwt-error';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cs.get<BackendConfig['jwtSecret']>('jwtSecret')
    });
  }

  // Passport owns JWT verification and requires this callback to reject failures.
  async validate(payload: any): Promise<UserTab> {
    let result: Result.Result<UserTab, AuthenticateJwtError> =
      await this.authenticateJwtResult({
        userId: payload.userId,
        iat: payload.iat
      });

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code
      });
    }

    let user: UserTab = result.value;

    return user;
  }

  private async authenticateJwtResult(item: {
    userId: string;
    iat: number;
  }): Result.ResultAsync<UserTab, AuthenticateJwtError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'user',
        (
          v
        ): Result.ResultAsync<
          UserTab,
          UserEntToTabError | BackendUserDoesNotExistError
        > =>
          this.db.drizzle.query.usersTable
            .findFirst({ where: eq(usersTable.userId, v.userId) })
            .then(x =>
              isUndefined(x)
                ? Result.fail({ code: 'BACKEND_USER_DOES_NOT_EXIST' })
                : this.tabService.userEntToTab({ userEnt: x })
            )
      ),
      Result.andThrough(v =>
        isDefined(v.user.jwtMinIat) && Number(v.user.jwtMinIat) > v.iat * 1000
          ? Result.fail({ code: 'BACKEND_NOT_AUTHORIZED' })
          : Result.succeed()
      ),
      Result.map((v): UserTab => v.user)
    );
  }
}
