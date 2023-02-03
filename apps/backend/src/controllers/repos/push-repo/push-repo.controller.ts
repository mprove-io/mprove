import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class PushRepoController {
  constructor(
    private projectsService: ProjectsService,
    private dbService: DbService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private blockmlService: BlockmlService,
    private cs: ConfigService<interfaces.Config>,
    private bridgesRepository: repositories.BridgesRepository,
    private branchesRepository: repositories.BranchesRepository,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPushRepo)
  async pushRepo(@AttachUser() user: entities.UserEntity, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendPushRepoRequest = request.body;

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

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (
      member.is_admin === common.BoolEnum.FALSE && // no check for repoId
      projectId === firstProjectId
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let toDiskPushRepoRequest: apiToDisk.ToDiskPushRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskPushRepo,
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

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskPushRepoResponse>({
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskPushRepoRequest,
        checkIsOk: true
      });

    let branchBridges = await this.bridgesRepository.find({
      where: {
        project_id: branch.project_id,
        repo_id: branch.repo_id,
        branch_id: branch.branch_id
      }
    });

    let prodBranch = await this.branchesRepository.findOne({
      where: {
        project_id: projectId,
        repo_id: common.PROD_REPO_ID,
        branch_id: branchId
      }
    });

    let prodBranchBridges = await this.bridgesRepository.find({
      where: {
        project_id: branch.project_id,
        repo_id: common.PROD_REPO_ID,
        branch_id: branch.branch_id
      }
    });

    if (common.isUndefined(prodBranch)) {
      prodBranch = maker.makeBranch({
        projectId: projectId,
        repoId: common.PROD_REPO_ID,
        branchId: branchId
      });

      branchBridges.forEach(x => {
        let prodBranchBridge = maker.makeBridge({
          projectId: branch.project_id,
          repoId: common.PROD_REPO_ID,
          branchId: branch.branch_id,
          envId: x.env_id,
          structId: common.EMPTY_STRUCT_ID,
          needValidate: common.BoolEnum.TRUE
        });

        prodBranchBridges.push(prodBranchBridge);
      });
    }

    await forEachSeries(prodBranchBridges, async x => {
      if (x.env_id === envId) {
        let structId = common.makeId();

        await this.blockmlService.rebuildStruct({
          traceId,
          orgId: project.org_id,
          projectId,
          structId,
          diskFiles: diskResponse.payload.productionFiles,
          mproveDir: diskResponse.payload.productionMproveDir,
          envId: x.env_id
        });

        x.struct_id = structId;
        x.need_validate = common.BoolEnum.FALSE;
      } else {
        x.struct_id = common.EMPTY_STRUCT_ID;
        x.need_validate = common.BoolEnum.TRUE;
      }
    });

    await this.dbService.writeRecords({
      modify: true,
      records: {
        branches: [prodBranch],
        bridges: [...prodBranchBridges]
      }
    });

    let currentBridge = branchBridges.find(y => y.env_id === envId);

    let struct = await this.structsService.getStructCheckExists({
      structId: currentBridge.struct_id,
      projectId: projectId
    });

    let payload: apiToBackend.ToBackendPushRepoResponsePayload = {
      repo: diskResponse.payload.repo,
      struct: wrapper.wrapToApiStruct(struct),
      needValidate: common.enumToBoolean(currentBridge.need_validate)
    };

    return payload;
  }
}
