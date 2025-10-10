import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, seconds } from '@nestjs/throttler';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { ReportDataService } from '~backend/services/report-data.service';
import { ReportsService } from '~backend/services/reports.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { DEFAULT_SRV_UI } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeCopy } from '~common/functions/make-copy';
import {
  ToBackendGetReportRequest,
  ToBackendGetReportResponsePayload
} from '~common/interfaces/to-backend/reports/to-backend-get-report';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
// reports.component.ts -> startCheckRunning()
@Throttle({
  '1s': {
    limit: 3 * 2 * 1.5
  },
  '5s': {
    limit: 5 * 2 * 1.5
  },
  '60s': {
    limit: (60 / 2) * 2 * 1.5
  },
  '600s': {
    limit: 10 * (60 / 2) * 2 * 1.5,
    blockDuration: seconds(12 * 60 * 60) // 12h
  }
})
@Controller()
export class GetReportController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private reportsService: ReportsService,
    private reportDataService: ReportDataService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private wrapToApiService: WrapEnxToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetReport)
  async getRep(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetReportRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      reportId,
      timeRangeFractionBrick,
      timeSpec,
      timezone
    } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
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

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
      // skipMetrics: false
    });

    let report = await this.reportsService.getReport({
      projectId: projectId,
      reportId: reportId,
      structId: bridge.structId,
      isCheckExist: true,
      isCheckAccess: true,
      user: user,
      userMember: userMember
    });

    // report.rows.forEach(row => {
    //   console.log('row.rowId');
    //   console.log(row.rowId);
    //   row.parameters.forEach(rowParameter => {
    //     console.log('rowParameter');
    //     console.log(rowParameter);
    //     console.log('rowParameter.fractions');
    //     console.log(rowParameter.fractions);
    //   });
    // });

    let userMemberApi = this.wrapToApiService.wrapToApiMember(userMember);

    let repApi = await this.reportDataService.getReportData({
      report: report,
      traceId: traceId,
      project: project,
      userMemberApi: userMemberApi,
      userMember: userMember,
      user: user,
      envId: envId,
      struct: struct,
      metrics: struct.metrics,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      timezone: timezone
    });

    user.ui = user.ui || makeCopy(DEFAULT_SRV_UI);
    user.ui.timezone = timezone;
    user.ui.timeSpec = timeSpec;
    user.ui.timeRangeFraction = repApi.timeRangeFraction;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                users: [user]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    // repApi.rows.forEach(row => {
    //   console.log('row.rowId');
    //   console.log(row.rowId);
    //   row.parameters.forEach(rowParameter => {
    //     console.log('rowParameter');
    //     console.log(rowParameter);
    //   });
    // });

    let payload: ToBackendGetReportResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: userMemberApi,
      report: repApi
    };

    return payload;
  }
}
