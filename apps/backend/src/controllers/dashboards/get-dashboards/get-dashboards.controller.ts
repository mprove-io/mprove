import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import {
  DashboardEnt,
  dashboardsTable
} from '~backend/drizzle/postgres/schema/dashboards';
import { ModelEnt, modelsTable } from '~backend/drizzle/postgres/schema/models';
import { checkAccess } from '~backend/functions/check-access';
import { checkModelAccess } from '~backend/functions/check-model-access';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { DashboardsService } from '~backend/services/db/dashboards.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ModelsService } from '~backend/services/db/models.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { StructsService } from '~backend/services/db/structs.service';
import { TabService } from '~backend/services/tab.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetDashboardsRequest,
  ToBackendGetDashboardsResponsePayload
} from '~common/interfaces/to-backend/dashboards/to-backend-get-dashboards';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetDashboardsController {
  constructor(
    private tabService: TabService,
    private branchesService: BranchesService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private dashboardsService: DashboardsService,
    private structsService: StructsService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetDashboards)
  async getDashboards(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetDashboardsRequest = request.body;

    let { projectId, isRepoProd, branchId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? PROD_REPO_ID : user.userId,
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

    let dashboards = await this.db.drizzle
      .select({
        dashboardId: dashboardsTable.dashboardId,
        draft: dashboardsTable.draft,
        creatorId: dashboardsTable.creatorId,
        st: dashboardsTable.st
        // lt: {},
      })
      .from(dashboardsTable)
      .where(
        and(
          eq(dashboardsTable.structId, bridge.structId),
          or(
            eq(dashboardsTable.draft, false),
            eq(dashboardsTable.creatorId, user.userId)
          )
        )
      )
      .then(xs =>
        xs.map(x => this.tabService.dashboardEntToTab(x as DashboardEnt))
      );

    let dashboardsGrantedAccess = dashboards.filter(x =>
      checkAccess({
        member: userMember,
        accessRoles: x.accessRoles
      })
    );

    let models = await this.db.drizzle
      .select({
        structId: modelsTable.structId,
        modelId: modelsTable.modelId,
        type: modelsTable.type,
        connectionId: modelsTable.connectionId,
        connectionType: modelsTable.connectionType,
        st: modelsTable.st,
        lt: modelsTable.lt
      })
      .from(modelsTable)
      .where(eq(modelsTable.structId, bridge.structId))
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x as ModelEnt)));

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let apiModels = models.map(model =>
      this.modelsService.tabToApi({
        model: model,
        hasAccess: checkModelAccess({
          member: userMember,
          modelAccessRoles: model.accessRoles
        })
      })
    );

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let payload: ToBackendGetDashboardsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({ struct: struct }),
      userMember: apiUserMember,
      models: apiModels.sort((a, b) =>
        a.label > b.label ? 1 : b.label > a.label ? -1 : 0
      ),
      dashboards: dashboardsGrantedAccess.map(x =>
        this.dashboardsService.tabToApi({
          dashboard: x,
          mconfigs: [],
          queries: [],
          member: apiUserMember,
          models: apiModels,
          isAddMconfigAndQuery: false
        })
      )
    };

    return payload;
  }
}
