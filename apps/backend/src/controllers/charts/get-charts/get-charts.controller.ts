import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { ModelEnt, modelsTable } from '~backend/drizzle/postgres/schema/models';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { checkAccess } from '~backend/functions/check-access';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
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

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetCharts)
  async getCharts(@AttachUser() user: UserEnt, @Req() request: any) {
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

    let charts = await this.db.drizzle.query.chartsTable.findMany({
      where: eq(chartsTable.structId, bridge.structId)
    });

    let chartsGrantedAccess = charts.filter(x =>
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
        connectionId: modelsTable.connectionId,
        connectionType: modelsTable.connectionType
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

    let payload: ToBackendGetChartsResponsePayload = {
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
      charts: chartsGrantedAccess.map(x =>
        this.wrapToApiService.wrapToApiChart({
          chart: x,
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
