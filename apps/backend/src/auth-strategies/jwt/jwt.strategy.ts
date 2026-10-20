import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { BackendConfig } from '#backend/config/backend-config';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';

import type { AuthenticateJwtError } from '#common/types/backend/function-errors/authenticate-jwt-error';
import type { DbUsersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/users/db-users-find-first-check-exists-error';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private db: DbService
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
      await this.authenticateJwt({
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

  private async authenticateJwt(item: {
    userId: string;
    iat: number;
  }): Result.ResultAsync<UserTab, AuthenticateJwtError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'user',
        (v): Result.ResultAsync<UserTab, DbUsersFindFirstCheckExistsError> =>
          this.db.users.findFirstCheckExists({
            where: eq(usersTable.userId, v.userId)
          })
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
