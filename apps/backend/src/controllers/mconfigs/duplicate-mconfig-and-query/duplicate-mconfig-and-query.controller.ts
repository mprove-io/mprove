import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class DuplicateMconfigAndQueryController {
  constructor(
    private dbService: DbService,
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private mconfigsService: MconfigsService,
    private queriesRepository: repositories.QueriesRepository,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDuplicateMconfigAndQuery
  )
  async duplicateMconfigAndQuery(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendDuplicateMconfigAndQueryRequest =
      request.body;

    let { traceId } = reqValid.info;
    let { projectId, isRepoProd, branchId, envId, oldMconfigId } =
      reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
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
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let oldMconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.struct_id,
      mconfigId: oldMconfigId
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.struct_id,
      modelId: oldMconfig.model_id
    });

    if (oldMconfig.struct_id !== bridge.struct_id) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_STRUCT_ID_CHANGED
      });
    }

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      entity: model
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let oldQuery = await this.queriesRepository.findOne({
      where: {
        query_id: oldMconfig.query_id,
        project_id: projectId
      }
    });

    let newMconfigId = common.makeId();
    let newQueryId = common.makeId();

    let newMconfig = Object.assign({}, oldMconfig, <entities.MconfigEntity>{
      mconfig_id: newMconfigId,
      query_id: newQueryId,
      temp: common.BoolEnum.TRUE
    });

    let newQuery = Object.assign({}, oldQuery, <entities.QueryEntity>{
      query_id: newQueryId
    });

    let records = await this.dbService.writeRecords({
      modify: false,
      records: {
        mconfigs: [newMconfig],
        queries: [newQuery]
      }
    });

    let payload: apiToBackend.ToBackendDuplicateMconfigAndQueryResponsePayload =
      {
        mconfig: wrapper.wrapToApiMconfig({
          mconfig: records.mconfigs[0],
          modelFields: model.fields
        }),
        query: wrapper.wrapToApiQuery(records.queries[0])
      };

    return payload;
  }
}
