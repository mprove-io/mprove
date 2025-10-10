import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { ModelEnt, modelsTable } from '~backend/drizzle/postgres/schema/models';
import { checkAccess } from '~backend/functions/check-access';
import { checkModelAccess } from '~backend/functions/check-model-access';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { ChartsService } from '~backend/services/db/charts.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ModelsService } from '~backend/services/db/models.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { StructsService } from '~backend/services/db/structs.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetChartsRequest,
  ToBackendGetChartsResponsePayload
} from '~common/interfaces/to-backend/charts/to-backend-get-charts';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetChartsController {
  constructor(
    private chartsService: ChartsService,
    private branchesService: BranchesService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetCharts)
  async getCharts(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetChartsRequest = request.body;

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

    let charts = await this.db.drizzle.query.chartsTable
      .findMany({
        where: eq(chartsTable.structId, bridge.structId)
      })
      .then(xs => xs.map(x => this.chartsService.entToTab(x)));

    let chartsGrantedAccess = charts.filter(x => {
      return checkAccess({
        member: userMember,
        accessRoles: x.accessRoles
      });
    });

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
      .then(xs => xs.map(x => this.modelsService.entToTab(x as ModelEnt)));

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
            modelAccessRoles: model.accessRoles
          })
        })
      )
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

    let payload: ToBackendGetChartsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({ struct: struct }),
      userMember: apiUserMember,
      models: apiModels,
      charts: chartsGrantedAccess.map(x =>
        this.chartsService.tabToApi({
          chart: x,
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
