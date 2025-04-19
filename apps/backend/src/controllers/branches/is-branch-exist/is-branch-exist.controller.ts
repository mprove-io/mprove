import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class IsBranchExistController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsBranchExist)
  async isBranchExist(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendIsBranchExistRequest = request.body;

    let { projectId, branchId, isRepoProd } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.userId;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    let branch = await this.db.drizzle.query.branchesTable.findFirst({
      where: and(
        eq(branchesTable.projectId, projectId),
        eq(branchesTable.repoId, repoId),
        eq(branchesTable.branchId, branchId)
      )
    });

    let payload: apiToBackend.ToBackendIsBranchExistResponsePayload = {
      isExist: common.isDefined(branch)
    };

    return payload;
  }
}
