import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { StructsService } from '~backend/services/db/structs.service';
import { ParentService } from '~backend/services/parent.service';
import { TabService } from '~backend/services/tab.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetQueriesRequest,
  ToBackendGetQueriesResponsePayload
} from '~common/interfaces/to-backend/queries/to-backend-get-queries';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
// dashboards.component.ts -> startCheckRunning()
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
    blockDuration: seconds(12 * 60 * 60) // 12h
  }
})
@Controller()
export class GetQueriesController {
  constructor(
    private tabService: TabService,
    private parentService: ParentService,
    private queriesService: QueriesService,
    private structsService: StructsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetQueries)
  async getQueries(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetQueriesRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, mconfigIds, skipData } =
      reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
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

    let env = await this.envsService.getEnvCheckExistsAndAccess({
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

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let mconfigs = await this.db.drizzle.query.mconfigsTable
      .findMany({
        where: and(
          eq(mconfigsTable.structId, bridge.structId),
          inArray(mconfigsTable.mconfigId, mconfigIds)
        )
      })
      .then(xs => xs.map(x => this.tabService.mconfigEntToTab(x)));

    let uniqueParentIds = [...new Set(mconfigs.map(x => x.parentId))];

    await forEachSeries(uniqueParentIds, async parentId => {
      let mconfig = mconfigs.find(x => x.parentId === parentId);

      await this.parentService.checkAccess({
        parentId: mconfig.parentId,
        parentType: mconfig.parentType,
        modelId: mconfig.modelId,
        user: user,
        userMember: userMember,
        structId: bridge.structId,
        projectId: projectId
      });
    });

    let queryIds = [...new Set(mconfigs.map(x => x.queryId))];

    let queries =
      skipData === true
        ? await this.queriesService.getQueriesCheckExistSkipSqlData({
            queryIds: queryIds,
            projectId: projectId
          })
        : await this.queriesService.getQueriesCheckExist({
            queryIds: queryIds,
            projectId: projectId
          });

    let payload: ToBackendGetQueriesResponsePayload = {
      queries: queries.map(x => this.queriesService.tabToApi({ query: x }))
    };

    return payload;
  }
}
