import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { eq } from 'drizzle-orm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { usersTable } from '~backend/drizzle/postgres/schema/users';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    cs: ConfigService<interfaces.Config>,
    @Inject(DRIZZLE) private db: Db
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cs.get<interfaces.Config['jwtSecret']>('jwtSecret')
    });
  }

  async validate(payload: any) {
    let user = await this.db.drizzle.query.usersTable.findFirst({
      where: eq(usersTable.userId, payload.userId)
    });

    // let user = await this.userRepository.findOne({
    //   where: {
    //     user_id: payload.userId
    //   }
    // });

    if (common.isUndefined(user)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    if (
      common.isDefined(user.jwtMinIat) &&
      Number(user.jwtMinIat) > payload.iat * 1000
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_NOT_AUTHORIZED
      });
    }

    return user;
  }
}
