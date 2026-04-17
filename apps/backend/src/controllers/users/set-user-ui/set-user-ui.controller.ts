import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSetUserUiRequestDto,
  ToBackendSetUserUiResponseDto
} from '#backend/controllers/users/set-user-ui/set-user-ui.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users.service';
import { TabService } from '#backend/services/tab.service';
import { RESTRICTED_USER_ALIAS } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendSetUserUiResponsePayload } from '#common/zod/to-backend/users/to-backend-set-user-ui';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
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
  @ApiOperation({
    summary: 'SetUserUi',
    description: "Update the user's UI preferences"
  })
  @ApiOkResponse({
    type: ToBackendSetUserUiResponseDto
  })
  async setUserUi(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetUserUiRequestDto
  ) {
    let { ui } = body.payload;

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
