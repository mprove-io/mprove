import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userRepository: repositories.UserRepository) {
    super({
      usernameField: 'payload[]email',
      passwordField: 'payload[]password'
    });
  }

  async validate(email: string, password: string) {
    let user = await this.userRepository.findOne({ email: email });

    if (helper.isUndefined(user)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    if (helper.isUndefined(user.hash)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_REGISTER_TO_SET_PASSWORD
      });
    }

    let hash = await bcrypt.hash(password, user.salt);

    if (hash !== user.hash) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_WRONG_PASSWORD
      });
    }

    return user;
  }
}
