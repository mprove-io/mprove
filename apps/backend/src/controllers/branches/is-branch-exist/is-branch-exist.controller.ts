import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendIsBranchExistRequest,
  ToBackendIsBranchExistResponsePayload
} from '~common/interfaces/to-backend/branches/to-backend-is-branch-exist';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class IsBranchExistController {
  constructor(
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendIsBranchExist)
  async isBranchExist(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendIsBranchExistRequest = request.body;

    let { projectId, branchId, isRepoProd } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    let branch = await this.db.drizzle.query.branchesTable
      .findFirst({
        where: and(
          eq(branchesTable.projectId, projectId),
          eq(branchesTable.repoId, repoId),
          eq(branchesTable.branchId, branchId)
        )
      })
      .then(x => this.branchesService.entToTab(x));

    let payload: ToBackendIsBranchExistResponsePayload = {
      isExist: isDefined(branch)
    };

    return payload;
  }
}
