import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

@Injectable()
export class TestRoutesGuard implements CanActivate {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  canActivate(context: ExecutionContext) {
    if (
      this.cs.get<interfaces.Config['allowTestRoutes']>('allowTestRoutes') !==
      common.BoolEnum.TRUE
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_TEST_ROUTES_FORBIDDEN
      });
    }

    return true;
  }
}
