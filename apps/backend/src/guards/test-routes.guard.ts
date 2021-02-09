import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

@Injectable()
export class TestRoutesGuard implements CanActivate {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  canActivate(context: ExecutionContext) {
    if (
      this.cs.get<interfaces.Config['allowTestRoutes']>('allowTestRoutes') ===
      common.BoolEnum.FALSE
    ) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_TEST_ROUTES_FORBIDDEN
      });
    }

    return true;
  }
}
