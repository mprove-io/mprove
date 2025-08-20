import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetOrgsListRequest,
  ToBackendGetOrgsListResponsePayload
} from '~common/interfaces/to-backend/orgs/to-backend-get-orgs-list';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetOrgsListController {
  constructor(
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetOrgsList)
  async getOrgsList(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetOrgsListRequest = request.body;

    let userMembers = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.memberId, user.userId)
    });

    let userProjectIds = userMembers.map(m => m.projectId);

    let userProjects =
      userProjectIds.length === 0
        ? []
        : await this.db.drizzle.query.projectsTable.findMany({
            where: inArray(projectsTable.projectId, userProjectIds)
          });

    let userOrgIds = userProjects.map(p => p.orgId);

    let userOrgs =
      userOrgIds.length === 0
        ? []
        : await this.db.drizzle.query.orgsTable.findMany({
            where: inArray(orgsTable.orgId, userOrgIds)
          });

    let ownerOrgs = await this.db.drizzle.query.orgsTable.findMany({
      where: eq(orgsTable.ownerId, user.userId)
    });

    let orgs = [...userOrgs];

    ownerOrgs.forEach(x => {
      if (orgs.map(y => y.orgId).indexOf(x.orgId) < 0) {
        orgs.push(x);
      }
    });

    let sortedOrgs = orgs.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );

    let payload: ToBackendGetOrgsListResponsePayload = {
      orgsList: sortedOrgs.map(x => this.wrapToApiService.wrapToApiOrgsItem(x))
    };

    return payload;
  }
}
