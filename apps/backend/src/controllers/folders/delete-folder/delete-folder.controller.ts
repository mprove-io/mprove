import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteFolderController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private dbService: DbService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private bridgesRepository: repositories.BridgesRepository,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteFolder)
  async deleteFolder(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendDeleteFolderRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, branchId, envId, folderNodeId } = reqValid.payload;

    let repoId = user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditor({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: user.user_id,
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

    let toDiskDeleteFolderRequest: apiToDisk.ToDiskDeleteFolderRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteFolder,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        folderNodeId: folderNodeId,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteFolderResponse>(
        {
          routingKey: helper.makeRoutingKeyToDisk({
            orgId: project.org_id,
            projectId: projectId
          }),
          message: toDiskDeleteFolderRequest,
          checkIsOk: true
        }
      );

    let branchBridges = await this.bridgesRepository.find({
      where: {
        project_id: branch.project_id,
        repo_id: branch.repo_id,
        branch_id: branch.branch_id
      }
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
          mproveDir: diskResponse.payload.mproveDir,
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

    let payload: apiToBackend.ToBackendDeleteFolderResponsePayload = {
      repo: diskResponse.payload.repo,
      struct: wrapper.wrapToApiStruct(struct),
      needValidate: common.enumToBoolean(currentBridge.need_validate)
    };

    return payload;
  }
}
