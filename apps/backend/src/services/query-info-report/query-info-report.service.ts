import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import type { PackerOutput } from '#backend/drizzle/postgres/drizzle-packer';
import type {
  BridgeTab,
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { ReportDataService } from '#backend/services/report-data/report-data.service';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { GetQueryInfoReportDataError } from '#common/types/backend/function-errors/get-query-info-report-data-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { ToBackendGetReportOutput } from '#common/types/backend/routes/reports/get-report/get-report-output';
import type { TimeSpec } from '#common/types/shared/time/timespec';

@Injectable()
export class QueryInfoReportService {
  constructor(
    private membersService: MembersService,
    private modelsService: ModelsService,
    private reportsService: ReportsService,
    private reportDataService: ReportDataService,
    private structsService: StructsService,
    private db: DbService
  ) {}

  async getQueryInfoReportData(item: {
    traceId: string;
    user: UserTab;
    userMember: MemberTab;
    project: ProjectTab;
    bridge: BridgeTab;
    projectId: string;
    envId: string;
    reportId: string;
    timezone: string;
    timeSpec: TimeSpec;
    timeRangeFractionBrick: string;
    skipUi: boolean;
  }): Result.ResultAsync<
    ToBackendGetReportOutput,
    GetQueryInfoReportDataError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('struct', v =>
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind('report', v =>
        this.reportsService.getReportCheckExistsAndAccess({
          projectId: v.projectId,
          reportId: v.reportId,
          structId: v.bridge.structId,
          user: v.user,
          userMember: v.userMember
        })
      ),
      Result.bind('apiUserMember', v =>
        Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind('apiReport', v =>
        this.reportDataService.getReportData({
          report: v.report,
          traceId: v.traceId,
          project: v.project,
          apiUserMember: v.apiUserMember,
          userMember: v.userMember,
          user: v.user,
          envId: v.envId,
          struct: v.struct,
          metrics: v.struct.metrics,
          timeSpec: v.timeSpec,
          timeRangeFractionBrick: v.timeRangeFractionBrick,
          timezone: v.timezone
        })
      ),
      Result.andThrough(async v => {
        if (v.skipUi === false) {
          v.user.ui = v.user.ui || makeCopy(DEFAULT_SRV_UI);

          v.user.ui.timezone = v.timezone;

          v.user.ui.timeSpec = v.timeSpec;

          v.user.ui.timeRangeFraction = v.apiReport.timeRangeFraction;

          let persistenceResult: Result.Result<PackerOutput, WriteError> =
            await this.db.write({
              insertOrUpdate: {
                users: [v.user]
              }
            });

          if (Result.isFailure(persistenceResult)) {
            return persistenceResult;
          }
        }

        return Result.succeed();
      }),
      Result.bind('modelPartXs', v =>
        this.modelsService.getModelPartXs({
          structId: v.struct.structId,
          apiUserMember: v.apiUserMember
        })
      ),
      Result.map(
        (v): ToBackendGetReportOutput => ({
          needValidate: v.bridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          userMember: v.apiUserMember,
          report: v.apiReport
        })
      )
    );
  }
}
