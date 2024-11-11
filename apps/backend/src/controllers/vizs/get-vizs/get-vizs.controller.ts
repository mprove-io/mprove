import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { vizsTable } from '~backend/drizzle/postgres/schema/vizs';
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
export class GetVizsController {
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

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs)
  async getVizs(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetVizsRequest = request.body;

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
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.userId,
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

    let vizs = await this.db.drizzle.query.vizsTable.findMany({
      where: eq(vizsTable.structId, bridge.structId)
    });

    // let vizs = await this.vizsRepository.find({
    //   where: {
    //     struct_id: bridge.struct_id
    //   }
    // });

    let vizsGrantedAccess = vizs.filter(x =>
      helper.checkAccess({
        userAlias: user.alias,
        member: userMember,
        entity: x
      })
    );

    let models = (await this.db.drizzle
      .select({
        modelId: modelsTable.modelId,
        accessUsers: modelsTable.accessUsers,
        accessRoles: modelsTable.accessRoles,
        hidden: modelsTable.hidden,
        connectionId: modelsTable.connectionId
      })
      .from(modelsTable)
      .where(
        eq(modelsTable.structId, bridge.structId)
      )) as schemaPostgres.ModelEnt[];

    // let models = await this.modelsRepository.find({
    //   select: [
    //     'model_id',
    //     'access_users',
    //     'access_roles',
    //     'hidden',
    //     'connection_id'
    //   ],
    //   where: { struct_id: bridge.struct_id }
    // });

    let modelsY = await this.modelsService.getModelsY({
      bridge: bridge,
      filterByModelIds: undefined,
      addFields: false
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetVizsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: apiMember,
      models: modelsY
        .map(model =>
          this.wrapToApiService.wrapToApiModel({
            model: model,
            hasAccess: helper.checkAccess({
              userAlias: user.alias,
              member: userMember,
              entity: model
            })
          })
        )
        .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0)),
      vizs: vizsGrantedAccess.map(x =>
        this.wrapToApiService.wrapToApiViz({
          viz: x,
          mconfigs: [],
          queries: [],
          member: this.wrapToApiService.wrapToApiMember(userMember),
          models: models.map(model =>
            this.wrapToApiService.wrapToApiModel({
              model: model,
              hasAccess: helper.checkAccess({
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
