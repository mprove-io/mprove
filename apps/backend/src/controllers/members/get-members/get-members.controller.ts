import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { asc, eq, inArray, sql } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendGetMembersRequest,
  ToBackendGetMembersResponsePayload
} from '~common/interfaces/to-backend/members/to-backend-get-members';
import { ServerError } from '~common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetMembersController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private wrapToApiService: WrapEnxToApiService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetMembers)
  async getMembers(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetMembersRequest = request.body;

    let { projectId, perPage, pageNum } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    let demoProjectId =
      this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

    if (userMember.isAdmin === false && projectId === demoProjectId) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let membersResult = await this.db.drizzle
      .select({
        record: membersTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(membersTable)
      .where(eq(membersTable.projectId, projectId))
      .orderBy(asc(membersTable.email))
      .limit(perPage)
      .offset((pageNum - 1) * perPage);

    let members = membersResult.map(x => x.record);

    let memberIds = members.map(x => x.memberId);

    let avatars =
      memberIds.length === 0
        ? []
        : await this.db.drizzle
            .select({
              userId: avatarsTable.userId,
              avatarSmall: avatarsTable.avatarSmall
            })
            .from(avatarsTable)
            .where(inArray(avatarsTable.userId, memberIds));

    let apiMembers = members.map(x => this.wrapToApiService.wrapToApiMember(x));

    apiMembers.forEach(x => {
      let avatar = avatars.find(a => a.userId === x.memberId);

      if (isDefined(avatar)) {
        x.avatarSmall = avatar.avatarSmall;
      }
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: ToBackendGetMembersResponsePayload = {
      userMember: apiMember,
      members: apiMembers,
      total: membersResult.length > 0 ? membersResult[0].total : 0
    };

    return payload;
  }
}
