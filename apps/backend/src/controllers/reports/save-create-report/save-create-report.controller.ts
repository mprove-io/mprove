import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { metricsTable } from '~backend/drizzle/postgres/schema/metrics';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeReportFileText } from '~backend/functions/make-report-file-text';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { ReportsService } from '~backend/services/reports.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class SaveCreateReportController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private blockmlService: BlockmlService,
    private reportsService: ReportsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private wrapToApiService: WrapToApiService,
    private wrapToEntService: WrapToEntService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveCreateReport)
  async saveCreateRep(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSaveCreateReportRequest = request.body;

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
      newReportId,
      fromReportId,
      accessRoles,
      accessUsers,
      title,
      timeSpec,
      timeRangeFractionBrick,
      timezone,
      newReportFields,
      chart
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
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
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (
      userMember.isAdmin === false &&
      projectId === firstProjectId &&
      repoId === common.PROD_REPO_ID
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let fromReport = await this.reportsService.getReport({
      projectId: projectId,
      reportId: fromReportId,
      structId: bridge.structId,
      checkExist: true,
      checkAccess: true,
      user: user,
      userMember: userMember
    });

    let metricRows = fromReport.rows.filter(
      row => row.rowType === common.RowTypeEnum.Metric
    );

    let metrics =
      metricRows.length > 0
        ? await this.db.drizzle.query.metricsTable.findMany({
            where: and(
              eq(metricsTable.structId, bridge.structId),
              inArray(
                metricsTable.metricId,
                metricRows.map(row => row.metricId)
              )
            )
          })
        : // await this.metricsRepository.find({
          //     where: {
          //       struct_id: bridge.struct_id,
          //       metric_id: In(metricRows.map(row => row.metricId))
          //     }
          //   })
          [];

    let repFileText = makeReportFileText({
      reportId: newReportId,
      accessRoles: accessRoles,
      accessUsers: accessUsers,
      title: title,
      rows: fromReport.rows,
      metrics: metrics,
      struct: currentStruct,
      newReportFields: newReportFields,
      chart: chart
    });

    let mdir = currentStruct.mproveDirValue;

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
      ].indexOf(currentStruct.mproveDirValue) > -1
        ? `${projectId}/${common.MPROVE_USERS_FOLDER}/${user.alias}`
        : `${projectId}/${mdir}/${common.MPROVE_USERS_FOLDER}/${user.alias}`;

    let fileName = `${newReportId}${common.FileExtensionEnum.Report}`;

    let toDiskCreateFileRequest: apiToDisk.ToDiskCreateFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias,
        parentNodeId: parentNodeId,
        fileName: fileName,
        fileText: repFileText,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateFileResponse>({
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskCreateFileRequest,
        checkIsOk: true
      });

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, branch.projectId),
        eq(bridgesTable.repoId, branch.repoId),
        eq(bridgesTable.branchId, branch.branchId)
      )
    });

    // let branchBridges = await this.bridgesRepository.find({
    //   where: {
    //     project_id: branch.project_id,
    //     repo_id: branch.repo_id,
    //     branch_id: branch.branch_id
    //   }
    // });

    await forEachSeries(branchBridges, async x => {
      if (x.envId !== envId) {
        x.structId = common.EMPTY_STRUCT_ID;
        x.needValidate = true;
      }
    });

    let { reports, struct } = await this.blockmlService.rebuildStruct({
      traceId: traceId,
      orgId: project.orgId,
      projectId: projectId,
      structId: bridge.structId,
      diskFiles: diskResponse.payload.files,
      mproveDir: diskResponse.payload.mproveDir,
      skipDb: true,
      envId: envId,
      overrideTimezone: undefined
    });

    let report = reports.find(x => x.reportId === newReportId);

    if (common.isDefined(report)) {
      report.rows = fromReport.rows;
    }

    let repEnt = common.isDefined(report)
      ? this.wrapToEntService.wrapToEntityReport(report)
      : undefined;

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          if (fromReport.draft === true) {
            await tx
              .delete(reportsTable)
              .where(
                and(
                  eq(reportsTable.projectId, projectId),
                  eq(reportsTable.reportId, fromReportId),
                  eq(reportsTable.draft, true),
                  eq(reportsTable.creatorId, user.userId)
                )
              );
          }

          await this.db.packer.write({
            tx: tx,
            insert: {
              reports: common.isDefined(repEnt) ? [repEnt] : []
            },
            insertOrUpdate: {
              structs: [struct],
              bridges: [...branchBridges]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    // await this.dbService.writeRecords({
    //   modify: true,
    //   records: {
    //     structs: [struct],
    //     bridges: [...branchBridges]
    //   }
    // });

    // if (fromRep.draft === true) {
    //   await this.repsRepository.delete({
    //     project_id: projectId,
    //     rep_id: fromRepId,
    //     draft: true,
    //     creator_id: user.user_id
    //   });
    // }

    // let records = await this.dbService.writeRecords({
    //   modify: false,
    //   records: {
    //     reps: [wrapper.wrapToEntityReport(rep)]
    //   }
    // });

    if (common.isUndefined(report)) {
      let fileId = `${parentNodeId}/${fileName}`;
      let fileIdAr = fileId.split('/');
      fileIdAr.shift();
      let underscoreFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CREATE_REPORT_FAIL,
        data: {
          underscoreFileId: underscoreFileId
        }
      });
    }

    let userMemberApi = this.wrapToApiService.wrapToApiMember(userMember);

    let repApi = await this.reportsService.getRepData({
      report: repEnt,
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

    let payload: apiToBackend.ToBackendSaveCreateReportResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: userMemberApi,
      report: repApi
    };

    return payload;
  }
}
