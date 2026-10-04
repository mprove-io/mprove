import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '#backend/services/db/users.service';
import { HashService } from '#backend/services/hash.service';
import { ServerError } from '#common/classes/server-error/server-error';

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

  async validate(email: string, password: string) {
    let user = await this.usersService.getUserByEmailCheckExists({
      email: email
    });

    this.usersService.checkUserPasswordHashIsDefined({ user: user });

    let passwordHash = await this.hashService.createHashUsingSalt({
      salt: user.passwordSalt,
      input: password
    });

    if (passwordHash !== user.passwordHash) {
      throw new ServerError({
        message: 'BACKEND_WRONG_PASSWORD'
      });
    }

    return user;
  }
}
