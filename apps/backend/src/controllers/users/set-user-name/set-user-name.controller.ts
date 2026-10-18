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
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSetUserNameRequestDto,
  ToBackendSetUserNameResponseDto
} from '#backend/controllers/users/set-user-name/set-user-name.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users/users.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { MemberEntToTabError } from '#common/types/backend/function-errors/member-ent-to-tab-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetUserNameOutput } from '#common/types/backend/routes/users/set-user-name/set-user-name-output';

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

  @Post('api/ToBackendSetUserName' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'setUserName'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        firstName: body.input.firstName,
        lastName: body.input.lastName
      }),
      Result.andThrough(v =>
        this.usersService.checkUserIsNotRestricted({ user: v.user })
      ),
      Result.map(v => {
        v.user.firstName = v.firstName;
        v.user.lastName = v.lastName;

        return v;
      }),
      Result.bind(
        'userMembers',
        (v): Result.ResultAsync<MemberTab[], MemberEntToTabError> =>
          this.db.drizzle.query.membersTable
            .findMany({
              where: eq(membersTable.memberId, v.user.userId)
            })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.memberEntToTab({ memberEnt: x })
              )
            )
      ),
      Result.map(v => {
        v.userMembers.forEach(member => {
          member.firstName = v.firstName;
          member.lastName = v.lastName;
        });

        return v;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.writeUnwrap({
                      tx: tx,
                      insertOrUpdate: {
                        users: [v.user],
                        members: v.userMembers
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.map(
        (v): ToBackendSetUserNameOutput => ({
          user: this.usersService.tabToApi({ user: v.user })
        })
      )
    );
  }
}
