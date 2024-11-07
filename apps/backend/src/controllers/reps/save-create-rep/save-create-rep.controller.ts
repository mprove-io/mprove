import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
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
import { ReportsService } from '~backend/services/reps.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class SaveCreateRepController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private blockmlService: BlockmlService,
    private repsService: ReportsService,
    private dbService: DbService,
    private repsRepository: repositories.RepsRepository,
    private bridgesRepository: repositories.BridgesRepository,
    private metricsRepository: repositories.MetricsRepository,
    private cs: ConfigService<interfaces.Config>,
    private envsService: EnvsService,
    private bridgesService: BridgesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveCreateRep)
  async saveCreateRep(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSaveCreateRepRequest = request.body;

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
      newRepId,
      fromRepId,
      accessRoles,
      accessUsers,
      title,
      timeSpec,
      timeRangeFractionBrick,
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

    let fromRep = await this.repsService.getRep({
      projectId: projectId,
      repId: fromRepId,
      structId: bridge.struct_id,
      checkExist: true,
      checkAccess: true,
      user: user,
      userMember: userMember
    });

    let metricRows = fromRep.rows.filter(
      row => row.rowType === common.RowTypeEnum.Metric
    );

    let metrics =
      metricRows.length > 0
        ? await this.metricsRepository.find({
            where: {
              struct_id: bridge.struct_id,
              metric_id: In(metricRows.map(row => row.metricId))
            }
          })
        : [];

    let repFileText = makeRepFileText({
      repId: newRepId,
      accessRoles: accessRoles,
      accessUsers: accessUsers,
      title: title,
      rows: fromRep.rows,
      metrics: metrics,
      struct: currentStruct
    });

    let mdir = currentStruct.mprove_dir_value;

    if (
      mdir.length > 2 &&
      mdir.substring(0, 2) === common.MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }

    let parentNodeId =
      [
        common.MPROVE_CONFIG_DIR_DOT,
        common.MPROVE_CONFIG_DIR_DOT_SLASH
      ].indexOf(currentStruct.mprove_dir_value) > -1
        ? `${projectId}/${common.MPROVE_USERS_FOLDER}/${user.alias}`
        : `${projectId}/${mdir}/${common.MPROVE_USERS_FOLDER}/${user.alias}`;

    let fileName = `${newRepId}${common.FileExtensionEnum.Rep}`;

    let toDiskCreateFileRequest: apiToDisk.ToDiskCreateFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias,
        parentNodeId: parentNodeId,
        fileName: fileName,
        fileText: repFileText,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateFileResponse>({
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskCreateFileRequest,
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

    await this.dbService.writeRecords({
      modify: true,
      records: {
        structs: [struct],
        bridges: [...branchBridges]
      }
    });

    if (fromRep.draft === common.BoolEnum.TRUE) {
      await this.repsRepository.delete({
        project_id: projectId,
        rep_id: fromRepId,
        draft: common.BoolEnum.TRUE,
        creator_id: user.user_id
      });
    }

    let rep = reps.find(x => x.repId === newRepId);

    if (common.isUndefined(rep)) {
      let fileId = `${parentNodeId}/${fileName}`;
      let fileIdAr = fileId.split('/');
      fileIdAr.shift();
      let underscoreFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CREATE_REP_FAIL,
        data: {
          underscoreFileId: underscoreFileId
        }
      });
    }

    rep.rows = fromRep.rows;

    let records = await this.dbService.writeRecords({
      modify: false,
      records: {
        reps: [wrapper.wrapToEntityReport(rep)]
      }
    });

    let userMemberApi = wrapper.wrapToApiMember(userMember);

    let repApi = await this.repsService.getRepData({
      rep: records.reps[0],
      traceId: traceId,
      project: project,
      userMemberApi: userMemberApi,
      userMember: userMember,
      user: user,
      envId: envId,
      struct: struct,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      timezone: timezone
    });

    let payload: apiToBackend.ToBackendSaveCreateRepResponsePayload = {
      needValidate: common.enumToBoolean(bridge.need_validate),
      struct: wrapper.wrapToApiStruct(struct),
      userMember: userMemberApi,
      rep: repApi
    };

    return payload;
  }
}
