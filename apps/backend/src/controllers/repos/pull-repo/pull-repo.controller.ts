import { Controller, Post } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class PullRepoController {
  constructor(
    private projectsService: ProjectsService,
    private dbService: DbService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private blockmlService: BlockmlService,
    private branchesService: BranchesService,
    private bridgesRepository: repositories.BridgesRepository,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPullRepo)
  async pullRepo(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendPullRepoRequest)
    reqValid: apiToBackend.ToBackendPullRepoRequest
  ) {
    let { traceId } = reqValid.info;
    let { projectId, isRepoProd, branchId, envId } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditor({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExists({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let toDiskPullRepoRequest: apiToDisk.ToDiskPullRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskPullRepo,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskPullRepoResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskPullRepoRequest,
        checkIsOk: true
      }
    );

    let branchBridges = await this.bridgesRepository.find({
      project_id: branch.project_id,
      repo_id: branch.repo_id,
      branch_id: branch.branch_id
    });

    await forEachSeries(branchBridges, async x => {
      if (x.env_id === envId) {
        let structId = common.makeId();

        await this.blockmlService.rebuildStruct({
          traceId,
          orgId: project.org_id,
          projectId,
          structId,
          diskFiles: diskResponse.payload.files,
          envId: x.env_id
        });

        x.struct_id = structId;
        x.need_validate = common.BoolEnum.FALSE;
      } else {
        x.need_validate = common.BoolEnum.TRUE;
      }
    });

    await this.dbService.writeRecords({
      modify: true,
      records: {
        bridges: [...branchBridges]
      }
    });

    let currentBridge = branchBridges.find(y => y.env_id === envId);

    let struct = await this.structsService.getStructCheckExists({
      structId: currentBridge.struct_id,
      projectId: projectId
    });

    let payload: apiToBackend.ToBackendPullRepoResponsePayload = {
      repo: diskResponse.payload.repo,
      struct: wrapper.wrapToApiStruct(struct),
      needValidate: common.enumToBoolean(currentBridge.need_validate)
    };

    return payload;
  }
}
