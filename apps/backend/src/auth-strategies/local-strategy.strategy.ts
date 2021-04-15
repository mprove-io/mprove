import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { UsersService } from '~backend/services/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userRepository: repositories.UsersRepository,
    private usersService: UsersService
  ) {
    super({
      usernameField: 'payload[]email',
      passwordField: 'payload[]password'
    });
  }

  async validate(email: string, password: string) {
    let user = await this.usersService.getUserByEmailCheckExists({
      email: email
    });

    this.usersService.checkUserHashIsDefined({ user: user });

    let hash = await bcrypt.hash(password, user.salt);

    if (hash !== user.hash) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_WRONG_PASSWORD
      });
    }

    return user;
  }
}
