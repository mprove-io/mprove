import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { makeRepFileText } from '~backend/functions/make-rep-file-text';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { RepsService } from '~backend/services/reps.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class SaveModifyRepController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private structsService: StructsService,
    private repsService: RepsService,
    private repsRepository: repositories.RepsRepository,
    private bridgesRepository: repositories.BridgesRepository,
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private blockmlService: BlockmlService,
    private dbService: DbService,
    private cs: ConfigService<interfaces.Config>,
    private envsService: EnvsService,
    private bridgesService: BridgesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveModifyRep)
  async getModels(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSaveModifyRepRequest = request.body;

    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      repId,
      draftRepId,
      accessRoles,
      accessUsers,
      rows,
      title,
      timeSpec,
      timeRangeFraction,
      timezone
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
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
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (
      userMember.is_admin === common.BoolEnum.FALSE &&
      projectId === firstProjectId &&
      repoId === common.PROD_REPO_ID
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let existingRep = await this.repsService.getRepCheckExists({
      structId: bridge.struct_id,
      repId: repId
    });

    if (
      userMember.is_admin === common.BoolEnum.FALSE &&
      userMember.is_editor === common.BoolEnum.FALSE
    ) {
      this.repsService.checkRepPath({
        userAlias: user.alias,
        filePath: existingRep.file_path
      });
    }

    let repFileText = makeRepFileText({
      repId: repId,
      title: title,
      rows: rows,
      accessRoles: accessRoles,
      accessUsers: accessUsers
    });

    let toDiskSaveFileRequest: apiToDisk.ToDiskSaveFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        fileNodeId: existingRep.file_path,
        userAlias: user.alias,
        content: repFileText,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskSaveFileResponse>({
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskSaveFileRequest,
        checkIsOk: true
      });

    let branchBridges = await this.bridgesRepository.find({
      where: {
        project_id: branch.project_id,
        repo_id: branch.repo_id,
        branch_id: branch.branch_id
      }
    });

    await forEachSeries(branchBridges, async x => {
      if (x.env_id !== envId) {
        x.struct_id = common.EMPTY_STRUCT_ID;
        x.need_validate = common.BoolEnum.TRUE;
      }
    });

    let { reps, struct } = await this.blockmlService.rebuildStruct({
      traceId,
      orgId: project.org_id,
      projectId,
      structId: bridge.struct_id,
      diskFiles: diskResponse.payload.files,
      mproveDir: diskResponse.payload.mproveDir,
      skipDb: true,
      envId: envId
    });

    let rep = reps.find(x => x.repId === repId);

    let records = await this.dbService.writeRecords({
      modify: true,
      records: {
        reps: common.isDefined(rep)
          ? [wrapper.wrapToEntityRep(rep)]
          : undefined,
        structs: [struct],
        bridges: [...branchBridges]
      }
    });

    await this.repsRepository.delete({
      project_id: projectId,
      rep_id: draftRepId,
      draft: common.BoolEnum.TRUE,
      creator_id: user.user_id
    });

    if (common.isUndefined(rep)) {
      await this.repsRepository.delete({
        rep_id: repId,
        struct_id: bridge.struct_id
      });

      let fileIdAr = existingRep.file_path.split('/');
      fileIdAr.shift();
      let underscoreFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MODIFY_REP_FAIL,
        data: {
          underscoreFileId: underscoreFileId
        }
      });
    }

    let { columns, isTimeColumnsLimitExceeded, timeColumnsLimit } =
      await this.blockmlService.getTimeColumns({
        traceId: traceId,
        timeSpec: timeSpec,
        timeRangeFraction: timeRangeFraction,
        projectWeekStart: struct.week_start
      });

    let apiMember = wrapper.wrapToApiMember(userMember);

    let repApi = common.isDefined(records.reps)
      ? wrapper.wrapToApiRep({
          rep: records.reps[0],
          member: apiMember,
          columns: columns,
          timezone: timezone,
          timeSpec: timeSpec,
          timeRangeFraction: timeRangeFraction,
          timeColumnsLimit: timeColumnsLimit,
          timeColumnsLength: columns.length,
          isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded
        })
      : undefined;

    let payload: apiToBackend.ToBackendGetRepResponsePayload = {
      needValidate: common.enumToBoolean(bridge.need_validate),
      struct: wrapper.wrapToApiStruct(struct),
      userMember: apiMember,
      rep: repApi
    };

    return payload;
  }
}
