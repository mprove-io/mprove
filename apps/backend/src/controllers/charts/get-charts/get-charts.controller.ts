import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetChartsRequestDto,
  ToBackendGetChartsResponseDto
} from '#backend/controllers/charts/get-charts/get-charts.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { ChartsService } from '#backend/services/db/charts.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { TabService } from '#backend/services/tab.service';
import { UNCATEGORIZED_SPACE_TITLE } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ServerError } from '#common/models/server-error';
import type { ToBackendGetChartsResponsePayload } from '#common/zod/to-backend/charts/to-backend-get-charts';

@ApiTags('Charts')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetChartsController {
  constructor(
    private tabService: TabService,
    private chartsService: ChartsService,
    private branchesService: BranchesService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetCharts)
  @ApiOperation({
    summary: 'GetCharts',
    description: 'List charts the user can access'
  })
  @ApiOkResponse({
    type: ToBackendGetChartsResponseDto
  })
  async getCharts(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetChartsRequestDto
  ) {
    let { projectId, repoId, branchId, envId } = body.payload;

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

    if (userMember.isExplorer === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
      });
    }

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

    let models = await this.db.drizzle.query.modelsTable
      .findMany({ where: eq(modelsTable.structId, bridge.structId) })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let apiModels = models
      .map(model =>
        this.modelsService.tabToApi({
          model: model,
          hasAccess: checkModelAccess({
            member: userMember,
            modelAccessRoles: model.accessRolesCombined
          }),
          spaceFullTitle: model.space
            ? struct.spaces.find(space => space.space === model.space)
                ?.fullTitle
            : UNCATEGORIZED_SPACE_TITLE
        })
      )
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

    let chartsCatalog = await this.chartsService.getChartsCatalog({
      projectId: projectId,
      structId: bridge.structId,
      user: user,
      apiUserMember: apiUserMember,
      models: models,
      spaces: struct.spaces ?? []
    });

    let payload: ToBackendGetChartsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({
        struct: struct,
        modelPartXs: apiModels
      }),
      userMember: apiUserMember,
      models: apiModels,
      chartUnitDrafts: chartsCatalog.chartUnitDrafts,
      chartSpaceNodes: chartsCatalog.chartSpaceNodes
    };

    return payload;
  }
}
