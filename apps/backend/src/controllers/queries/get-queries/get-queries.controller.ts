import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { and, eq, inArray } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { QueriesService } from '~backend/services/queries.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetQueriesRequest,
  ToBackendGetQueriesResponsePayload
} from '~common/interfaces/to-backend/queries/to-backend-get-queries';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM) // TODO: throttle
@Controller()
export class GetQueriesController {
  constructor(
    private queriesService: QueriesService,
    private structsService: StructsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetQueries)
  async getQueries(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetQueriesRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, mconfigIds } =
      reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditorOrAdmin({
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
      member: member
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

    let mconfigs = await this.db.drizzle.query.mconfigsTable.findMany({
      where: and(
        eq(mconfigsTable.structId, bridge.structId),
        inArray(mconfigsTable.mconfigId, mconfigIds)
      )
    });

    let queryIds = [...new Set(mconfigs.map(x => x.queryId))];

    let queries = await this.queriesService.getQueriesCheckExistSkipSqlData({
      queryIds: queryIds,
      projectId: projectId
    });

    let payload: ToBackendGetQueriesResponsePayload = {
      queries: queries.map(x => this.wrapToApiService.wrapToApiQuery(x))
    };

    return payload;
  }
}
