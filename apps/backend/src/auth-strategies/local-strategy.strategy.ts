import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { UsersService } from '~backend/services/db/users.service';
import { ErEnum } from '~common/enums/er.enum';
import { ServerError } from '~common/models/server-error';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
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
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_PASSWORD
      });
    }

    return user;
  }
}
