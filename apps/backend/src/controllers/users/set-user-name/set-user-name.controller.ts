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
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { UsersService } from '#backend/services/db/users.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendSetUserNameRequest,
  ToBackendSetUserNameResponsePayload
} from '#common/interfaces/to-backend/users/to-backend-set-user-name';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
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
  async setUserName(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSetUserNameRequest = request.body;

    this.usersService.checkUserIsNotRestricted({ user: user });

    let { firstName, lastName } = reqValid.payload;

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
