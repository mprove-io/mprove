import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetDashboardsController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetDashboards)
  async getDashboards(@AttachUser() user: UserEnt, @Req() request: any) {
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

    let dashboards = (await this.db.drizzle
      .select({
        dashboardId: dashboardsTable.dashboardId,
        draft: dashboardsTable.draft,
        creatorId: dashboardsTable.creatorId,
        filePath: dashboardsTable.filePath,
        accessRoles: dashboardsTable.accessRoles,
        title: dashboardsTable.title,
        gr: dashboardsTable.gr,
        hidden: dashboardsTable.hidden,
        fields: dashboardsTable.fields,
        tiles: dashboardsTable.tiles,
        description: dashboardsTable.description
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
      )) as DashboardEnt[];

    let dashboardsGrantedAccess = dashboards.filter(x =>
      checkAccess({
        userAlias: user.alias,
        member: userMember,
        entity: x
      })
    );

    let models = (await this.db.drizzle
      .select({
        modelId: modelsTable.modelId,
        accessRoles: modelsTable.accessRoles,
        hidden: modelsTable.hidden,
        connectionId: modelsTable.connectionId
      })
      .from(modelsTable)
      .where(eq(modelsTable.structId, bridge.structId))) as ModelEnt[];

    let modelsY = await this.modelsService.getModelsY({
      bridge: bridge,
      filterByModelIds: undefined,
      addFields: false,
      addContent: false
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: ToBackendGetDashboardsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: apiMember,
      models: modelsY
        .map(model =>
          this.wrapToApiService.wrapToApiModel({
            model: model,
            hasAccess: checkAccess({
              userAlias: user.alias,
              member: userMember,
              entity: model
            })
          })
        )
        .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0)),
      dashboards: dashboardsGrantedAccess.map(x =>
        this.wrapToApiService.wrapToApiDashboard({
          dashboard: x,
          mconfigs: [],
          queries: [],
          member: this.wrapToApiService.wrapToApiMember(userMember),
          models: models.map(model =>
            this.wrapToApiService.wrapToApiModel({
              model: model,
              hasAccess: checkAccess({
                userAlias: user.alias,
                member: userMember,
                entity: model
              })
            })
          ),
          isAddMconfigAndQuery: false
        })
      )
    };

    return payload;
  }
}
