import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Result } from '@praha/byethrow';
import { Strategy } from 'passport-local';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { checkUserPasswordHashIsDefined } from '#backend/functions/db/users/check-user-password-hash-is-defined/check-user-password-hash-is-defined';
import { getUserByEmailCheckExists } from '#backend/functions/db/users/get-user-by-email-check-exists/get-user-by-email-check-exists';
import { createHashUsingSalt } from '#backend/functions/hash/create-hash-using-salt/create-hash-using-salt';
import { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { AuthenticateLocalError } from '#common/types/backend/function-errors/authenticate-local-error';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private db: DbService) {
    super({
      usernameField: 'input[]email',
      passwordField: 'input[]password'
    });
  }

  // Passport invokes this callback with positional credentials and requires rejection.
  async validate(email: string, password: string): Promise<UserTab> {
    let result: Result.Result<UserTab, AuthenticateLocalError> =
      await this.authenticateLocal({ email: email, password: password });

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code
      });
    }

    let user: UserTab = result.value;

    return user;
  }

  private async authenticateLocal(item: {
    email: string;
    password: string;
  }): Result.ResultAsync<UserTab, AuthenticateLocalError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('user', v =>
        getUserByEmailCheckExists({
          email: v.email,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        checkUserPasswordHashIsDefined({
          user: v.user
        })
      ),
      Result.bind('passwordHash', async v => {
        let passwordHash: string = await createHashUsingSalt({
          salt: v.user.passwordSalt,
          input: v.password
        });

        return Result.succeed(passwordHash);
      }),
      Result.andThrough(v =>
        v.passwordHash !== v.user.passwordHash
          ? Result.fail({ code: 'BACKEND_WRONG_PASSWORD' })
          : Result.succeed()
      ),
      Result.map((v): UserTab => v.user)
    );
  }
}
