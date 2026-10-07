import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetReportsRequestDto,
  ToBackendGetReportsResponseDto
} from '#backend/controllers/reports/get-reports/get-reports.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { TabService } from '#backend/services/tab/tab.service';

import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetReportsOutput } from '#common/types/backend/routes/reports/get-reports/get-reports-output';

@ApiTags('Reports')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetReportsController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private modelsService: ModelsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private reportsService: ReportsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendGetReports' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetReports',
    description: 'List reports'
  })
  @ApiOkResponse({
    type: ToBackendGetReportsResponseDto
  })
  async getReports(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetReportsRequestDto
  ) {
    let { projectId, repoId, branchId, envId } = body.input;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: true
    });

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

    let modelIds = struct.metrics
      .filter(m => isDefined(m.modelId))
      .map(x => x.modelId);

    let models = await this.db.drizzle.query.modelsTable
      .findMany({
        where: and(
          inArray(modelsTable.modelId, modelIds),
          eq(modelsTable.structId, struct.structId)
        )
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let apiModels = models.map(model =>
      this.modelsService.tabToApi({
        model: model,
        hasAccess: checkModelAccess({
          member: userMember,
          modelAccessRoles: model.accessRolesCombined
        })
      })
    );

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let reportsCatalog = await this.reportsService.getReportsCatalog({
      projectId: projectId,
      structId: bridge.structId,
      user: user,
      userMember: userMember,
      apiUserMember: apiUserMember,
      spaces: struct.spaces
    });

    let payload: ToBackendGetReportsOutput = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({
        struct: struct,
        modelPartXs: apiModels
      }),
      userMember: apiUserMember,
      reportUnitDrafts: reportsCatalog.reportUnitDrafts,
      reportSpaceNodes: reportsCatalog.reportSpaceNodes,
      storeModels: apiModels.filter(model => model.type === 'Store')
    };

    return payload;
  }
}
