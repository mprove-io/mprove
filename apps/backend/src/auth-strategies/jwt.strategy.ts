import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private userRepository: repositories.UsersRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cs.get<interfaces.Config['jwtSecret']>('jwtSecret')
    });
  }

  async validate(payload: any) {
    let user = await this.userRepository.findOne(payload.userId);

    if (helper.isUndefined(user)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    return user;
  }
}
