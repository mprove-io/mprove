import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { common } from '~backend/barrels/common';
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
    let user = await this.userRepository.findOne({
      where: {
        user_id: payload.userId
      }
    });

    if (common.isUndefined(user)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    if (
      common.isDefined(user.jwt_min_iat) &&
      Number(user.jwt_min_iat) > payload.iat * 1000
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_NOT_AUTHORIZED
      });
    }

    return user;
  }
}
