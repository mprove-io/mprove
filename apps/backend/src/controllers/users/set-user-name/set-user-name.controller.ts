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
import { eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSetUserNameRequestDto,
  ToBackendSetUserNameResponseDto
} from '#backend/controllers/users/set-user-name/set-user-name.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendSetUserNameResponsePayload } from '#common/zod/to-backend/users/to-backend-set-user-name';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetUserNameController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetUserName)
  @ApiOperation({
    summary: 'SetUserName',
    description: "Update the user's first and last name"
  })
  @ApiOkResponse({
    type: ToBackendSetUserNameResponseDto
  })
  async setUserName(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetUserNameRequestDto
  ) {
    this.usersService.checkUserIsNotRestricted({ user: user });

    let { firstName, lastName } = body.payload;

    user.firstName = firstName;
    user.lastName = lastName;

    let userMembers = await this.db.drizzle.query.membersTable
      .findMany({
        where: eq(membersTable.memberId, user.userId)
      })
      .then(xs => xs.map(x => this.tabService.memberEntToTab(x)));

    userMembers.map(member => {
      member.firstName = firstName;
      member.lastName = lastName;
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                users: [user],
                members: userMembers
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendSetUserNameResponsePayload = {
      user: this.usersService.tabToApi({ user: user })
    };

    return payload;
  }
}
