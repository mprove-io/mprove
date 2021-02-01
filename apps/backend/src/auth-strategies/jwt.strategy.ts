import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { api } from '~backend/barrels/api';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private userRepository: repositories.UserRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cs.get<interfaces.Config['backendJwtSecret']>(
        'backendJwtSecret'
      )
    });
  }

  async validate(payload: any) {
    let user = await this.userRepository.findOne(payload.userId);

    if (helper.isUndefined(user)) {
      throw new api.ServerError({
        message: api.ErEnum.M_BACKEND_USER_DOES_NOT_EXIST
      });
    }

    return user;
  }
}
