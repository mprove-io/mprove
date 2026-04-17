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
  ToBackendEditMemberRequestDto,
  ToBackendEditMemberResponseDto
} from '#backend/controllers/members/edit-member/edit-member.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  AvatarEnt,
  avatarsTable
} from '#backend/drizzle/postgres/schema/avatars';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendEditMemberResponsePayload } from '#common/zod/to-backend/members/to-backend-edit-member';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditMemberController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendEditMember)
  @ApiOperation({
    summary: 'EditMember',
    description: "Update a member's roles"
  })
  @ApiOkResponse({
    type: ToBackendEditMemberResponseDto
  })
  async editMember(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditMemberRequestDto
  ) {
    let { projectId, memberId, isAdmin, isEditor, isExplorer, roles } =
      body.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    if (memberId === user.userId && isAdmin === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_ADMIN_CANNOT_CHANGE_HIS_ADMIN_STATUS
      });
    }

    let member = await this.membersService.getMemberCheckExists({
      memberId: memberId,
      projectId: projectId
    });

    member.isAdmin = isAdmin;
    member.isEditor = isEditor;
    member.isExplorer = isExplorer;
    member.roles = roles;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                members: [member]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let avatars = await this.db.drizzle
      .select({
        keyTag: avatarsTable.keyTag,
        userId: avatarsTable.userId,
        st: avatarsTable.st
        // lt: {},
      })
      .from(avatarsTable)
      .where(eq(avatarsTable.userId, member.memberId))
      .then(xs => xs.map(x => this.tabService.avatarEntToTab(x as AvatarEnt)));

    let avatar = avatars.length > 0 ? avatars[0] : undefined;

    let apiMember = this.membersService.tabToApi({ member: member });

    if (isDefined(avatar)) {
      apiMember.avatarSmall = avatar.avatarSmall;
    }

    let payload: ToBackendEditMemberResponsePayload = {
      member: apiMember
    };

    return payload;
  }
}
