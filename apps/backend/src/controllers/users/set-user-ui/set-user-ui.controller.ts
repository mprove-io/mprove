import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { RESTRICTED_USER_ALIAS } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendSetUserUiRequest,
  ToBackendSetUserUiResponsePayload
} from '~common/interfaces/to-backend/users/to-backend-set-user-ui';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetUserUiController {
  constructor(
    private wrapToApiService: WrapEnxToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetUserUi)
  async setUserUi(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSetUserUiRequest = request.body;

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { ui } = reqValid.payload;

    user.ui = ui;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                users: [user]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendSetUserUiResponsePayload = {
      user: this.wrapToApiService.wrapToApiUser(user)
    };

    return payload;
  }
}
