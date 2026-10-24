import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  type ToBackendSetUserNameRequestDto,
  ToBackendSetUserNameResponseDto
} from '#backend/controllers/users/set-user-name/set-user-name.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { checkUserIsNotRestricted } from '#backend/functions/db/users/check-user-is-not-restricted/check-user-is-not-restricted';
import { userTabToApi } from '#backend/functions/db/users/user-tab-to-api/user-tab-to-api';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetUserNameOutput } from '#common/types/backend/routes/users/set-user-name/set-user-name-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetUserNameController {
  constructor(private db: DbService) {}

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
        checkUserIsNotRestricted({
          user: v.user
        })
      ),
      Result.map(v => {
        v.user.firstName = v.firstName;
        v.user.lastName = v.lastName;

        return v;
      }),
      Result.bind('userMembers', v =>
        this.db.members.findMany({
          where: eq(membersTable.memberId, v.user.userId)
        })
      ),
      Result.map(v => {
        v.userMembers.forEach(member => {
          member.firstName = v.firstName;
          member.lastName = v.lastName;
        });

        return v;
      }),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            users: [v.user],
            members: v.userMembers
          }
        })
      ),
      Result.map(
        (v): ToBackendSetUserNameOutput => ({
          user: userTabToApi({
            user: v.user
          })
        })
      )
    );
  }
}
