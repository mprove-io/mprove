import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Result } from '@praha/byethrow';
import { Strategy } from 'passport-local';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { UsersService } from '#backend/services/db/users/users.service';
import { HashService } from '#backend/services/hash/hash.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { AuthenticateLocalError } from '#common/types/backend/function-errors/authenticate-local-error';
import type { GetUserByEmailCheckExistsError } from '#common/types/backend/function-errors/get-user-by-email-check-exists-error';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private hashService: HashService,
    private usersService: UsersService
  ) {
    super({
      usernameField: 'input[]email',
      passwordField: 'input[]password'
    });
  }

  // Passport invokes this callback with positional credentials and requires rejection.
  async validate(email: string, password: string): Promise<UserTab> {
    let result: Result.Result<UserTab, AuthenticateLocalError> =
      await this.authenticateLocalResult({ email: email, password: password });

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code
      });
    }

    let user: UserTab = result.value;

    return user;
  }

  private async authenticateLocalResult(item: {
    email: string;
    password: string;
  }): Result.ResultAsync<UserTab, AuthenticateLocalError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'user',
        (v): Result.ResultAsync<UserTab, GetUserByEmailCheckExistsError> =>
          this.usersService.getUserByEmailCheckExistsResult({ email: v.email })
      ),
      Result.andThrough(v =>
        this.usersService.checkUserPasswordHashIsDefinedResult({ user: v.user })
      ),
      Result.bind(
        'passwordHash',
        async (v): Result.ResultAsync<string, never> => {
          let passwordHash: string = await this.hashService.createHashUsingSalt(
            {
              salt: v.user.passwordSalt,
              input: v.password
            }
          );

          return Result.succeed(passwordHash);
        }
      ),
      Result.andThrough(v =>
        v.passwordHash !== v.user.passwordHash
          ? Result.fail({ code: 'BACKEND_WRONG_PASSWORD' })
          : Result.succeed()
      ),
      Result.map((v): UserTab => v.user)
    );
  }
}
