import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendSetUserUiRequestDto,
  ToBackendSetUserUiResponseDto
} from '#backend/controllers/users/set-user-ui/set-user-ui.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { UsersService } from '#backend/services/db/users/users.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { RESTRICTED_USER_ALIAS } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetUserUiOutput } from '#common/types/backend/routes/users/set-user-ui/set-user-ui-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetUserUiController {
  constructor(
    private usersService: UsersService,
    private db: DbService
  ) {}

  @Post('api/ToBackendSetUserUi' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'setUserUi'>> {
    return Result.pipe(
      Result.succeed({ user: user, ui: body.input.ui }),
      Result.andThrough(async v => {
        if (v.user.alias === RESTRICTED_USER_ALIAS) {
          return Result.succeed();
        }

        v.user.ui = v.ui;

        return this.db.write({
          insertOrUpdate: {
            users: [v.user]
          }
        });
      }),
      Result.map(
        (v): ToBackendSetUserUiOutput => ({
          user: this.usersService.tabToApi({ user: v.user })
        })
      )
    );
  }
}
