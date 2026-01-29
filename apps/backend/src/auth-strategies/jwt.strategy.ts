import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { eq } from 'drizzle-orm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { TabService } from '#backend/services/tab.service';
import { ErEnum } from '#common/enums/er.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cs.get<BackendConfig['jwtSecret']>('jwtSecret')
    });
  }

  async validate(payload: any) {
    let user = await this.db.drizzle.query.usersTable
      .findFirst({
        where: eq(usersTable.userId, payload.userId)
      })
      .then(x => this.tabService.userEntToTab(x));

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    if (
      isDefined(user.jwtMinIat) &&
      Number(user.jwtMinIat) > payload.iat * 1000
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_NOT_AUTHORIZED
      });
    }

    return user;
  }
}
