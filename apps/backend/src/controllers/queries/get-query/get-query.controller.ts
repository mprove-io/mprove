import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MconfigsService } from '~backend/services/db/mconfigs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { ParentService } from '~backend/services/parent.service';
import { TabService } from '~backend/services/tab.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetQueryRequest,
  ToBackendGetQueryResponsePayload
} from '~common/interfaces/to-backend/queries/to-backend-get-query';
import { ServerError } from '~common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
// chart-dialog.component.ts -> startCheckRunning()
// models.component.ts -> checkRunning$
@Throttle({
  '1s': {
    limit: 3 * 2 * 1.5
  },
  '5s': {
    limit: 5 * 2 * 1.5
  },
  '60s': {
    limit: (60 / 3) * 2 * 1.5
  },
  '600s': {
    limit: 10 * (60 / 3) * 2 * 1.5,
    blockDuration: seconds(12 * 60 * 60)
  }
})
@Controller()
export class GetQueryController {
  constructor(
    private tabService: TabService,
    private queriesService: QueriesService,
    private parentService: ParentService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private mconfigsService: MconfigsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetQuery)
  async getQuery(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetQueryRequest = request.body;

    let { queryId, mconfigId, projectId, isRepoProd, branchId, envId } =
      reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let mconfig = await this.mconfigsService.getMconfigCheckExists({
      mconfigId: mconfigId,
      structId: bridge.structId
    });

    if (mconfig.queryId !== queryId) {
      throw new ServerError({
        message: ErEnum.BACKEND_MCONFIG_QUERY_ID_MISMATCH
      });
    }

    await this.parentService.checkAccess({
      parentId: mconfig.parentId,
      parentType: mconfig.parentType,
      modelId: mconfig.modelId,
      user: user,
      userMember: userMember,
      structId: bridge.structId,
      projectId: projectId
    });

    let query = await this.queriesService.getQueryCheckExists({
      queryId: queryId,
      projectId: projectId
    });

    let payload: ToBackendGetQueryResponsePayload = {
      query: this.queriesService.tabToApi({ query: query })
    };

    return payload;
  }
}
