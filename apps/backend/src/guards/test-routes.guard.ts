import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { BoolEnum } from '~common/enums/bool.enum';
import { ErEnum } from '~common/enums/er.enum';
import { ServerError } from '~common/models/server-error';

@Injectable()
export class TestRoutesGuard implements CanActivate {
  constructor(private cs: ConfigService<BackendConfig>) {}

  canActivate(context: ExecutionContext) {
    if (
      this.cs.get<BackendConfig['allowTestRoutes']>('allowTestRoutes') !==
      BoolEnum.TRUE
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_TEST_ROUTES_FORBIDDEN
      });
    }

    return true;
  }
}
