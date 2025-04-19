import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { asc, eq, inArray, sql } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetMembersController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMembers)
  async getMembers(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetMembersRequest = request.body;

    let { projectId, perPage, pageNum } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (userMember.isAdmin === false && projectId === firstProjectId) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
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

      if (common.isDefined(avatar)) {
        x.avatarSmall = avatar.avatarSmall;
      }
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetMembersResponsePayload = {
      userMember: apiMember,
      members: apiMembers,
      total: membersResult.length > 0 ? membersResult[0].total : 0
    };

    return payload;
  }
}
