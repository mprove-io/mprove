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
import { RESTRICTED_USER_ALIAS } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendSetUserUiRequest,
  ToBackendSetUserUiResponsePayload
} from '#common/interfaces/to-backend/users/to-backend-set-user-ui';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { UsersService } from '~backend/services/db/users.service';
import { TabService } from '~backend/services/tab.service';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetUserUiController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetUserUi)
  async setUserUi(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSetUserUiRequest = request.body;

    let { ui } = reqValid.payload;

    if (user.alias !== RESTRICTED_USER_ALIAS) {
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
    }

    let payload: ToBackendSetUserUiResponsePayload = {
      user: this.usersService.tabToApi({ user: user })
    };

    return payload;
  }
}
