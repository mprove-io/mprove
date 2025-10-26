import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { and, eq, inArray } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import {
  AvatarEnt,
  avatarsTable
} from '~backend/drizzle/postgres/schema/avatars';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { TabService } from '~backend/services/tab.service';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendGetMembersRequest,
  ToBackendGetMembersResponsePayload
} from '~common/interfaces/to-backend/members/to-backend-get-members';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetMembersController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetMembers)
  async getMembers(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetMembersRequest = request.body;

    let { projectId, perPage, pageNum } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    await this.projectsService.checkProjectIsNotRestricted({
      projectId: projectId,
      userMember: userMember,
      repoId: undefined
    });

    let sortedMembers = await this.db.drizzle.query.membersTable
      .findMany({
        where: and(eq(membersTable.projectId, projectId))
      })
      .then(xs =>
        xs
          .map(x => this.tabService.memberEntToTab(x))
          .sort((a, b) => (a.email > b.email ? 1 : b.email > a.email ? -1 : 0))
      );

    let offset = (pageNum - 1) * perPage;

    let members = sortedMembers.slice(offset, offset + perPage);

    let memberIds = members.map(x => x.memberId);

    let avatars =
      memberIds.length === 0
        ? []
        : await this.db.drizzle
            .select({
              keyTag: avatarsTable.keyTag,
              userId: avatarsTable.userId,
              st: avatarsTable.st
            })
            .from(avatarsTable)
            .where(inArray(avatarsTable.userId, memberIds))
            .then(xs =>
              xs.map(x => this.tabService.avatarEntToTab(x as AvatarEnt))
            );

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let apiMembers = members.map(x =>
      this.membersService.tabToApi({ member: x })
    );

    apiMembers.forEach(x => {
      let avatar = avatars.find(a => a.userId === x.memberId);

      if (isDefined(avatar)) {
        x.avatarSmall = avatar.avatarSmall;
      }
    });

    let payload: ToBackendGetMembersResponsePayload = {
      userMember: apiUserMember,
      members: apiMembers,
      total: sortedMembers.length
    };

    return payload;
  }
}
